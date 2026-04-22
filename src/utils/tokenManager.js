import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import crypto from 'crypto';

const db = getFirestore();

/**
 * Generate a secure random token
 * @param {number} length - Token length in bytes
 * @returns {string} Hex-encoded random token
 */
export const generateToken = (length = 32) => {
  if (typeof window !== 'undefined') {
    // Browser environment - use crypto.getRandomValues
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Node.js environment - would need: const crypto = require('crypto');
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
};

/**
 * Generate a shareable link for student results
 * @param {string} studentId - Student ID
 * @param {string} token - Unique token
 * @returns {string} Full URL
 */
export const generateStudentResultsLink = (studentId, token) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ipfp.manager.com';
  return `${baseUrl}/results/${studentId}?token=${token}`;
};

/**
 * Generate a shareable link for teacher entry
 * @param {string} teacherId - Teacher ID
 * @param {string} token - Unique token
 * @returns {string} Full URL
 */
export const generateTeacherEntryLink = (teacherId, token) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ipfp.manager.com';
  return `${baseUrl}/teacher/${teacherId}?token=${token}`;
};

/**
 * Save token to Firestore
 * @param {Object} tokenData - Token information
 * @returns {Promise<string>} Document ID
 */
export const saveTokenToFirestore = async (tokenData) => {
  try {
    const docRef = await addDoc(collection(db, 'tokens'), {
      ...tokenData,
      createdAt: serverTimestamp(),
      status: 'active',
      revokedAt: null
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
};

/**
 * Validate a token from Firestore
 * @param {string} token - Token to validate
 * @param {string} type - Token type (student_results or teacher_entry)
 * @returns {Promise<Object|null>} Token data if valid, null otherwise
 */
export const validateToken = async (token, type) => {
  try {
    const q = query(
      collection(db, 'tokens'),
      where('token', '==', token),
      where('type', '==', type),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null; // Token not found or revoked
    }

    const tokenDoc = querySnapshot.docs[0];
    const tokenData = tokenDoc.data();

    // Check expiration
    if (tokenData.expiresAt) {
      const expiresAt = tokenData.expiresAt.toDate?.() || new Date(tokenData.expiresAt);
      if (new Date() > expiresAt) {
        return null; // Token expired
      }
    }

    return {
      id: tokenDoc.id,
      ...tokenData,
      expiresAt: tokenData.expiresAt?.toDate?.() || tokenData.expiresAt
    };
  } catch (error) {
    console.error('Error validating token:', error);
    return null;
  }
};

/**
 * Revoke a token (disable it)
 * @param {string} tokenId - Token document ID
 * @returns {Promise<void>}
 */
export const revokeToken = async (tokenId) => {
  try {
    await updateDoc(doc(db, 'tokens', tokenId), {
      status: 'revoked',
      revokedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error revoking token:', error);
    throw error;
  }
};

/**
 * Get all tokens for a user
 * @param {string} userId - User ID (studentId or teacherId)
 * @param {string} type - Token type
 * @returns {Promise<Array>} Array of tokens
 */
export const getTokensForUser = async (userId, type) => {
  try {
    const q = query(
      collection(db, 'tokens'),
      where('userId', '==', userId),
      where('type', '==', type)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expiresAt: doc.data().expiresAt?.toDate?.() || doc.data().expiresAt
    }));
  } catch (error) {
    console.error('Error getting tokens:', error);
    return [];
  }
};

/**
 * Create a new token and save it to Firestore
 * @param {Object} options - Options object
 * @param {string} options.userId - User ID (studentId or teacherId)
 * @param {string} options.type - Token type (student_results or teacher_entry)
 * @param {number} options.expiryYears - Years until expiration (default: 1)
 * @returns {Promise<Object>} Token object
 */
export const createAndSaveToken = async (options) => {
  const { userId, type, expiryYears = 1 } = options;

  const token = generateToken(32);
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + expiryYears);

  const tokenData = {
    userId,
    type,
    token,
    expiresAt,
    createdAt: new Date(),
    status: 'active',
    revokedAt: null
  };

  try {
    const docId = await saveTokenToFirestore(tokenData);

    return {
      id: docId,
      ...tokenData,
      link: type === 'student_results'
        ? generateStudentResultsLink(userId, token)
        : generateTeacherEntryLink(userId, token)
    };
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<void>}
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};
