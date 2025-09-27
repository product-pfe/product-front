import { createContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
}

// Create the AuthContext
export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  refreshToken: null,
  setTokens: () => {},
});

type AuthProviderProps = {
  children: ReactNode;
};

// AuthProvider Component
function AuthProvider(props: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
    }

    if (storedRefreshToken) {
      setRefreshToken(storedRefreshToken);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    } else {
      localStorage.removeItem("accessToken");
    }

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    } else {
      localStorage.removeItem("refreshToken");
    }
  }, [accessToken, refreshToken]);

  const setTokens = (
    newAccessToken: string | null,
    newRefreshToken: string | null
  ) => {
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
  };

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, setTokens }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
