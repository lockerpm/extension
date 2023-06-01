import MainBackground from './background/main.background';

// eslint-disable-next-line no-var
const bitwardenMain = (self as any).bitwardenMain = new MainBackground();
bitwardenMain.bootstrap().then(() => {
  // Finished bootstrapping
});

