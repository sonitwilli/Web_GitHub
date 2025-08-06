export const wait = async ({ time }: { time: number } = { time: 200 }) => {
  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time || 200);
  });
};
