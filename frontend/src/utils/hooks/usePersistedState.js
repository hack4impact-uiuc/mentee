import React, { useEffect } from "react";

/**
 * useState Hook that uses local storage for persistent data
 * This is also a very barebones implementation to avoid needing an all out
 * Redux implementation
 */

// Bless this person...
// Source:
// https://dev.to/selbekk/persisting-your-react-state-in-9-lines-of-code-9go
export default function usePersistedState(key, defaultValue) {
  const [state, setState] = React.useState(() => {
    const persisted = JSON.parse(localStorage.getItem(key));
    return persisted != null ? persisted : defaultValue;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState];
}
