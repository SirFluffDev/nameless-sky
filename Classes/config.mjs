class Info {
  data = {};

  set(name, value) {
    this.data[name] = value;
  }

  get(name) {
    return this.data[name];
  }
}

const config = new Info();

export { config };