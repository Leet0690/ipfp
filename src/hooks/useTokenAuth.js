import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { validateToken } from '../utils/tokenManager';

/**
 * Hook for validating tokens from URL query parameters
 * @param {string} tokenType - Type of token to validate (student_results or teacher_entry)
 * @returns {Object} Token validation state
 */
export const useTokenAuth = (tokenType) => {
  const [searchParams] = useSearchParams();
  const [isValid, setIsValid] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      setLoading(true);
      setError(null);
      setIsValid(false);
      setIsExpired(false);

      if (!token) {
        setError('No access token provided');
        setLoading(false);
        return;
      }

      try {
        const validatedToken = await validateToken(token, tokenType);

        if (!validatedToken) {
          setError('Invalid or expired access link');
          setIsExpired(true);
          setLoading(false);
          return;
        }

        // Token is valid
        setUserData({
          userId: validatedToken.userId,
          tokenId: validatedToken.id,
          createdAt: validatedToken.createdAt,
          expiresAt: validatedToken.expiresAt,
          type: validatedToken.type
        });

        setIsValid(true);
        setError(null);
      } catch (err) {
        console.error('Token validation error:', err);
        setError('Error validating access link');
        setIsValid(false);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, tokenType]);

  return {
    isValid,
    isExpired,
    userData,
    loading,
    error,
    token
  };
};

export default useTokenAuth;
