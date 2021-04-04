class Promise {
  constructor(executor) {
    this.promiseState = "pending";
    this.promiseResult = null;
    this.callbacks = [];
    //保存实例对象this的值
    const that = this;
    //resolve函数
    function resolve(data) {
      if (that.promiseState !== "pending") return;
      that.promiseState = "fulfilled";
      that.promiseResult = data;

      setTimeout(() => {
        that.callbacks.forEach((item) => {
          item.onResolved(data);
        });
      });
    }
    //reject函数
    function reject(data) {
      if (that.promiseState !== "pending") return;
      that.promiseState = "rejected";
      that.promiseResult = data;

      setTimeout(() => {
        that.callbacks.forEach((item) => {
          item.onRejected(data);
        });
      });
    }

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onResolved, onRejected) {
    const that = this;

    if (typeof onResolved !== "function") {
      onResolved = (value) => value;
    }
    if (typeof onRejected !== "function") {
      onRejected = (reason) => {
        throw reason;
      };
    }

    return new Promise((resolve, reject) => {
      function callback(type) {
        try {
          let result = type(that.promiseResult);
          if (result instanceof Promise) {
            result.then(
              (v) => {
                resolve(v);
              },
              (r) => {
                reject(r);
              }
            );
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(e);
        }
      }
      if (this.promiseState === "fulfilled") {
        setTimeout(() => {
          callback(onResolved);
        });
      }
      if (this.promiseState === "rejected") {
        setTimeout(() => {
          callback(onRejected);
        });
      }
      if ((this.promiseState = "pending")) {
        //保存回调函数
        this.callbacks.push({
          onResolved: function () {
            callback(onResolved);
          },
          onRejected: function () {
            callback(onRejected);
          },
        });
      }
    });
  }
  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  static resolve(value) {
    return new Promise((resolve, reject) => {
      if (value instanceof Promise) {
        value.then(
          (v) => resolve(v),
          (r) => reject(r)
        );
      } else {
        resolve(value);
      }
    });
  }

  static reject(reason) {
    return new Promise((resolve, reject) => {
      reject(reason);
    });
  }

  static all(promises) {
    return new Promise((resolve, reject) => {
      let count = 0;
      let arr = [];
      for (let i = 0; i < promises.length; i++) {
        promises[i].then(
          (v) => {
            count++;
            arr[i] = v;
            if (count === promises.length) {
              resolve(arr);
            }
          },
          (r) => {
            reject(r);
          }
        );
      }
    });
  }

  static race(promises) {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        promises[i].then(
          (v) => resolve(v),
          (r) => reject(r)
        );
      }
    });
  }
}
