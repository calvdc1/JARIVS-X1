/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { JarvisUI } from './components/JarvisUI';
import { SplashScreen } from './components/SplashScreen';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <main className="min-h-screen bg-jarvis-bg">
      <AnimatePresence mode="wait">
        {loading ? (
          <SplashScreen key="splash" onComplete={() => setLoading(false)} />
        ) : (
          <JarvisUI key="ui" />
        )}
      </AnimatePresence>
    </main>
  );
}
