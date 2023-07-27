import MainBackground from './background/main.background';

const lockerMain = (self as any).lockerMain = new MainBackground();
lockerMain.bootstrap().then(() => {
  // Finished bootstrapping
});
