function promiseAll(promises) {
  const res = new Array(promises.length);
  let count = 0;

  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i]
        .catch((e) => {
          reject(e);
        })
        .then((p) => {
          res[i] = p;
          count++;

          if (count === promises.length) resolve(res);
        });
    }
  });
}

const p = await promiseAll([
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
]);

// const p = await Promise.all([
//   new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve(1000);
//     }, 1000);
//   }),

//   new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve(2000);
//     }, 2000);
//   }),
//   new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve(3000);
//     }, 3000);
//   }),
//   new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve(new Error("err"));
//     }, 500);
//   }),
// ]);

console.log(p);
