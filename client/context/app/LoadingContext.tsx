import { createContext, useCallback, useContext, useMemo, useState } from "react";

type LoaderType = "global" | "minimal" | null;

interface LoaderContextType {
  loading: boolean;
  type: LoaderType;
  setType: (t: LoaderType) => void;
}

const LoaderContext = createContext<LoaderContextType | null>(null);

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context)
    throw new Error("useLoader debe ser usado dentro de un LoaderProvider");
  return context;
};

export const LoaderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<LoaderType>("minimal");

  const setTypeAndLoading = useCallback((t: LoaderType) => {
    if (t === null) {
      setLoading(false);
    } else {
      setLoading(true);
      setType(t);
    }
  }, []); 

  
  const contextValue = useMemo(
    () => ({
      loading,
      type,
      setType: setTypeAndLoading,
    }),
    [loading, type, setTypeAndLoading] 
  );

  return (
    <LoaderContext.Provider
      value={contextValue}
    >
      {children}
    </LoaderContext.Provider>
  );
};
