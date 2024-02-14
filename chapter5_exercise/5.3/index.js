class TaskQueuePC {
  constructor(concurrency) {
    this.taskQueue = [];
    this.consumerQueue = [];

    // spawn consumer
    for (let i = 0; i < concurrency; i++) {
      this.consumer();
    }
  }

  async consumer() {
    function loop() {
      this.getNextTask()
        .then((task) => {
          return task();
        })
        .catch((e) => console.log(e))
        .then(() => {
          loop.bind(this)();
        });
    }

    loop.bind(this)();
  }

  getNextTask() {
    return new Promise((resolve) => {
      if (this.taskQueue.length !== 0) {
        return resolve(this.taskQueue.shift());
      }

      this.consumerQueue.push(resolve); // which is here, resolving line 46
    });
  }

  runTask(task) {
    return new Promise((resolve, reject) => {
      const taskWrapper = () => {
        const taskPromise = task();

        taskPromise.then(resolve, reject);

        return taskPromise;
      };

      if (this.consumerQueue.length !== 0) {
        const consumer = this.consumerQueue.shift();
        consumer(taskWrapper); // this will eventually wake the consumer. line 15
      } else {
        this.taskQueue.push(taskWrapper);
      }
    });
  }
}

new TaskQueuePC(3);
