// Global variable to track SituationWarning visibility
export let isSituationWarningVisible = false;

// Function to update the global state
export const setSituationWarningVisible = (value: boolean | null) => {
  isSituationWarningVisible = !!value;
};
