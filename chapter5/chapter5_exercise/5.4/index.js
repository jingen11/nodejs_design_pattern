async function mapAsync(iterable, callback, concurrency) {
  let running = 0;
  let completed = 0;
  let index = 0;
  const res = new Array(iterable.length);

  const wrapper = async (index) => {
    const p = await callback(iterable[index], index);

    return [p, index];
  };

  return new Promise((resolve) => {
    function next() {
      if (index === iterable.length) {
        return resolve(res);
      }

      while (running < concurrency && index < iterable.length) {
        wrapper(index)
          .then(([r, index]) => {
            res[index] = r;

            if (++completed === iterable.length) {
              return resolve(res);
            }
          })
          .finally(() => {
            running--;
            next();
          });
        running++;
        index++;
      }
    }

    next();
  });
}

console.log(
  await mapAsync(
    [
      new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(1000);
        }, 1000);
      }),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(2000);
        }, 2000);
      }),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(3000);
        }, 3000);
      }),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(new Error("err"));
        }, 500);
      }),
    ],
    async (promise, index) => {
      const res = await promise;
      return res + 1;
    },
    1
  )
);
