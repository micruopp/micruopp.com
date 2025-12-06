// hello.tsx
// A test page.

import Layout from '../components/layout';

export default function HelloPage() {
  let pageName = "hello";
  return (
    <Layout pageName={pageName}>
      <p>hello, world!</p>
    </Layout>
  );
}
