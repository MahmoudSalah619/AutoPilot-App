import { View, ActivityIndicator, StyleSheet } from 'react-native';
import useInitialRouting from '../hooks/useInitialRouting';
import { Redirect, RelativePathString } from 'expo-router';

const InitialScreen = () => {
  const { targetPath } = useInitialRouting();

  if (!targetPath) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <Redirect href={targetPath as RelativePathString} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InitialScreen;
