import { useState, useCallback } from 'react';
import {
  createAndSaveToken,
  getTokensForUser,
  revokeToken,
  copyToClipboard
} from '../utils/tokenManager';

/**
 * Hook for managing token lifecycle
 * @returns {Object} Token management methods
 */
export const useTokenManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const generateAndCopyLink = useCallback(async (userId, type, userName) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await createAndSaveToken({
        userId,
        type,
        expiryYears: 1
      });

      // Copy link to clipboard
      const copied = await copyToClipboard(token.link);

      if (copied) {
        setSuccess(`Link copied to clipboard for ${userName}`);
      } else {
        setSuccess(`Link generated: ${token.link}`);
      }

      return {
        success: true,
        token,
        copied
      };
    } catch (err) {
      const errorMsg = `Failed to generate link: ${err.message}`;
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const getStudentLinks = useCallback(async (studentId) => {
    setLoading(true);
    setError(null);

    try {
      const links = await getTokensForUser(studentId, 'student_results');
      return links;
    } catch (err) {
      setError(`Failed to fetch links: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getTeacherLinks = useCallback(async (teacherId) => {
    setLoading(true);
    setError(null);

    try {
      const links = await getTokensForUser(teacherId, 'teacher_entry');
      return links;
    } catch (err) {
      setError(`Failed to fetch links: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeLink = useCallback(async (tokenId) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await revokeToken(tokenId);
      setSuccess('Link revoked successfully');
      return { success: true };
    } catch (err) {
      const errorMsg = `Failed to revoke link: ${err.message}`;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    loading,
    error,
    success,
    generateAndCopyLink,
    getStudentLinks,
    getTeacherLinks,
    revokeLink,
    clearMessages
  };
};

export default useTokenManagement;
