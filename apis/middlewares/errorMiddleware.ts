import { isRejectedWithValue } from '@reduxjs/toolkit';
import HandleErrors from '@/utils/handleErrors';

type NextFunction = (action: any) => void;

const rtkQueryErrorLogger = () => (next: NextFunction) => (action: any) => {
  if (isRejectedWithValue(action)) {
    // Handle different error payload structures
    const errorData = action?.payload?.data || action?.payload || action?.error;
    if (errorData) {
      HandleErrors(errorData);
    } else {
      HandleErrors('Network or server error occurred');
    }
  }

  return next(action);
};

export default rtkQueryErrorLogger;
