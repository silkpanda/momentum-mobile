import { Redirect } from "expo-router";

export default function Index() {
  // This root index file will now redirect to our main (app) layout.
  // We must point to the specific 'index' screen within the (app) group.
  return <Redirect href="/(app)/index" />;
}