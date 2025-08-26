import React, { Suspense } from "react";

const layout = ({ children }) => {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
};

export default layout;