import Toast from 'react-native-toast-message';

export default function HandleErrors(err: any) {
  const showErrorToast = (msg: string) => {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: msg,
    });
  };
  
  console.log('err=>:', err);
  
  // Handle null, undefined, or non-object errors
  if (!err || typeof err !== 'object') {
    if (typeof err === 'string' && err.trim()) {
      showErrorToast(err);
    } else {
      showErrorToast('خطأ غير متوقع!');
    }
    return;
  }
  
  // Now we know err is an object, safe to check properties
  if (err?.error && err?.message) {
    showErrorToast(err.message);
  } else if (err?.details?.reason) {
    showErrorToast(err.details.reason);
  } else if (err?.message) {
    showErrorToast(err.message);
  } else if (err?.details?.length) {
    showErrorToast(err.details.join(', '));
  } else if (err?.detail) {
    showErrorToast(err.detail);
  } else if (Object.keys(err).length > 0) {
    const firstKey = Object.keys(err)[0];
    const firstValue = err[firstKey];
    if (typeof firstValue === 'string' && firstValue.trim()) {
      showErrorToast(firstValue);
    } else {
      showErrorToast(String(firstValue) || 'خطأ غير متوقع!');
    }
  } else {
    showErrorToast('خطأ غير متوقع!');
  }
}
