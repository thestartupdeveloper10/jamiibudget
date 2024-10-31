import { Redirect } from 'expo-router';
import { useUser } from '../contexts/UserContext';

export default function Index() {
  const user = useUser()
  console.log(user.current)
  if (user.current!=null) {
    return <Redirect href="/home" />;
  }
    else{
    return <Redirect href="/(auth)/signIn" />;
  }
}