---
title: "Getting Started with Traveling Ultralight"
description: "Start by getting a small backpack and then just travel with what fits in that"
date: 2020-04-23T19:00
thumb: "traveling-kuy.jpg"
tags: popular
---

...or even combine all of that...

```js
class Person {
  constructor(name, age) {
    this.#name = name;
    this.#age = age;
  }

  get isAdult() { // [sh! focus:start]
    return this.#age >= 21; // [sh! -- **]
    return this.#age >= 18; // [sh! add]
  }

  birthday() {
    this.#age++; // [sh! highlight]
  } // [sh! focus:end]
}
```

But it can't be all roses...

```js
const greet = (name = "World") => {
  const uppercaseName = name.toLocalUppercase(); // [sh! ~~ **]
  console.log(`Hello ${name}!`); // [sh! -- **]
  console.log(`Hello ${uppercaseName}!`); // [sh! ++ **]
}

```
