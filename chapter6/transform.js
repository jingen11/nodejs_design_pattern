import { createReadStream } from "fs";
import { Transform } from "stream";
import { parse } from "csv-parse";

const csvParser = parse({ columns: true });

class FilterByCountry extends Transform {
  constructor(country, options = {}) {
    options.objectMode = true;
    super(options);
    this.country = country;
  }

  _transform(record, enc, cb) {
    if (record.country === this.country) {
      this.push(record);
    }
    cb();
  }
}

class SumProfit extends Transform {
  constructor(options = {}) {
    options.objectMode = true;
    super(options);
    this.total = 0;
  }

  _transform(record, enc, cb) {
    this.total += Number.parseFloat(record.profit);
    cb();
  }

  _flush(cb) {
    this.push(this.total.toString());
    cb();
  }
}

createReadStream("data.csv")
  .pipe(csvParser)
  .pipe(new FilterByCountry("Italy"))
  .pipe(new SumProfit())
  .pipe(process.stdout);
