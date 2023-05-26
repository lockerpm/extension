import MainBackground from './background/main.background';
// eslint-disable-next-line no-var
const win = window ?? self;
const bitwardenMain = (win as any).bitwardenMain = new MainBackground();
bitwardenMain.bootstrap().then(() => {
  // Finished bootstrapping
});

