import { createReadStream } from "fs";
import { Transform, pipeline } from "stream";

import { parse } from "csv-parse";

class YearCrimeTransform extends Transform {
  constructor(options) {
    super({ ...options, objectMode: true });

    this.years = {};
    this.rowRead = 0;
  }

  _transform(chunk, enc, cb) {
    if (!this.years[chunk.year]) {
      this.years[chunk.year] = { count: 1, year: chunk.year };
    } else {
      this.years[chunk.year].count++;
    }

    cb();
  }

  _flush(cb) {
    const years = Object.values(this.years);

    years.sort((a, b) => a.year - b.year);

    const res = new Array(years.length - 1).fill(null);

    for (let i = 0; i < years.length - 1; i++) {
      if (years[i + 1].count > years[i].count) res[i] = true;
      else if (years[i + 1].count < years[i].count) res[i] = false;
    }

    this.push(JSON.stringify(res));
    cb();
  }
}

class DangerousTransform extends Transform {
  constructor(options) {
    super({ ...options, objectMode: true });

    this.lsoas = {};
    this.rowRead = 0;
  }

  _transform(chunk, enc, cb) {
    if (!this.lsoas[chunk.lsoa_code]) {
      this.lsoas[chunk.lsoa_code] = { count: 1, lsoa: chunk.lsoa_code };
    } else {
      this.lsoas[chunk.lsoa_code].count++;
    }

    cb();
  }

  _flush(cb) {
    const lsoas = Object.values(this.lsoas);

    lsoas.sort((a, b) => b.count - a.count);
    const res = [lsoas[0].lsoa];
    const max = lsoas[0].count;

    for (let i = 1; i < lsoas.length; i++) {
      if (lsoas[i].count < max) break;
      if (lsoas[i].count === max) res.push(lsoas[i].lsoa);
    }

    this.push(JSON.stringify(res));
    cb();
  }
}

class MostCommonTransform extends Transform {
  constructor(options) {
    super({ ...options, objectMode: true });

    this.lsoas = {};
    this.rowRead = 0;
  }

  _transform(chunk, enc, cb) {
    if (!this.lsoas[chunk.lsoa_code]) {
      this.lsoas[chunk.lsoa_code] = {};
    }

    if (!this.lsoas[chunk.lsoa_code][chunk.major_category]) {
      this.lsoas[chunk.lsoa_code][chunk.major_category] = {
        count: 1,
        crime: chunk.major_category,
      };
    } else {
      this.lsoas[chunk.lsoa_code][chunk.major_category].count++;
    }
    cb();
  }

  _flush(cb) {
    const res = {};

    for (const lsoa in this.lsoas) {
      const crimes = Object.values(this.lsoas[lsoa]);
      crimes.sort((a, b) => a.count - b.count);
      res[lsoa] = crimes[0].crime;
    }

    this.push(JSON.stringify(res));
    cb();
  }
}

class LeastCommonTransform extends Transform {
  constructor(options) {
    super({ ...options, objectMode: true });

    this.crimes = {};
    this.rowRead = 0;
  }

  _transform(chunk, enc, cb) {
    if (!this.crimes[chunk.major_category]) {
      this.crimes[chunk.major_category] = {
        count: 1,
        crime: chunk.major_category,
      };
    } else {
      this.crimes[chunk.major_category].count++;
    }

    cb();
  }

  _flush(cb) {
    const crimes = Object.values(this.crimes);

    crimes.sort((a, b) => b.count - a.count);
    const res = [crimes[0].crime];
    const max = crimes[0].count;

    for (let i = 1; i < crimes.length; i++) {
      if (crimes[i].count < max) break;
      if (crimes[i].count === max) res.push(crimes[i].crime);
    }

    this.push(JSON.stringify(res));
    cb();
  }
}

const inputStream = createReadStream("./london.csv");

inputStream
  .pipe(parse({ columns: true }))
  .pipe(new YearCrimeTransform())
  .pipe(process.stdout);

inputStream
  .pipe(parse({ columns: true }))
  .pipe(new DangerousTransform())
  .pipe(process.stdout);
inputStream
  .pipe(parse({ columns: true }))
  .pipe(new MostCommonTransform())
  .pipe(process.stdout);
inputStream
  .pipe(parse({ columns: true }))
  .pipe(new LeastCommonTransform())
  .pipe(process.stdout);
