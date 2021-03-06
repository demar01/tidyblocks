'use strict'

const random = require('random')

const util = require('./util')
const {
  ExprBase,
  ExprValue
} = require('./expr')

/**
 * Indicate that persisted JSON is a value.
 */
const FAMILY = '@value'

/**
 * Absent value (placeholder for incomplete expressions).
 * - Requires no parameters.
 * - Is exactly equal to other incomplete expressions.
 * - Cannot be run.
 */
class ValueAbsent extends ExprBase {
  constructor () {
    super(FAMILY, 'absent')
  }

  equal (other) {
    return other instanceof ValueAbsent
  }

  run (row, i) {
    util.fail('Missing expression')
  }
}

/**
 * Row number.
 * - Requires no parameters.
 * - Is exactly equal to other row number expressions.
 * - Generates the row number.
 */
class ValueRowNum extends ExprBase {
  constructor () {
    super(FAMILY, 'rownum')
  }

  equal (other) {
    return other instanceof ValueRowNum
  }

  run (row, i) {
    return i
  }
}

/**
 * Column value.
 */
class ValueColumn extends ExprValue {
  /**
   * Construct.
   * @param {string} column The name of the column to get the value from.  This
   * cannot be checked against actual columns at construction time because we do
   * not know what upstream blocks may have added to or remove from the table.
   */
  constructor (name) {
    util.check(name && (typeof name === 'string'),
               `Column name must be string`)
    super(FAMILY, 'column', name)
  }

  /**
   * Extract the value of a column given its name.
   * @param row The row.
   * @param i The row number.
   * @returns The value (of any type).
   */
  run (row, i) {
    util.check(typeof row === 'object',
               `Row must be object`)
    util.check(this.value in row,
               `${this.name} not in row ${i}`)
    return row[this.value]
  }
}

/**
 * A constant datetime value.
 */
class ValueDatetime extends ExprValue {
  /**
   * Construct.
   * @param {string} value `MISSING`, a `Date` object, or a string that can be converted to one.
   */
  constructor (value) {
    value = util.makeDate(value)
    util.check((value === util.MISSING) || (value instanceof Date),
               `Datetime value "${value}" must be MISSING, date, or convertible string`)
    super(FAMILY, 'datetime', value)
  }

  /**
   * Produce the constant datetime value.
   * @param row The row.
   * @param i The row number.
   * @returns The constant datetime value.
   */
  run (row, i) {
    return this.value
  }
}

/**
 * A constant logical (Boolean) value.
 */
class ValueLogical extends ExprValue {
  /**
   * Construct.
   * @param {string} value `MISSING` or a `boolean` value.
   */
  constructor (value) {
    util.check((value === util.MISSING) || (typeof value === 'boolean'),
               `Logical value "${value}" must be MISSING or true/false`)
    super(FAMILY, 'logical', value)
  }

  /**
   * Produce the constant logical value.
   * @param row The row.
   * @param i The row number.
   * @returns The constant logical value.
   */
  run (row, i) {
    return this.value
  }
}

/**
 * A constant numeric value.
 */
class ValueNumber extends ExprValue {
  /**
   * Construct.
   * @param {string} value `MISSING` or a numeric value.
   */
  constructor (value) {
    util.check((value === util.MISSING) || (typeof value === 'number'),
               `Numeric value "${value}" must be missing or number`)
    super(FAMILY, 'number', value)
  }

  /**
   * Produce the constant numeric value.
   * @param row The row.
   * @param i The row number.
   * @returns The constant numeric value.
   */
  run (row, i) {
    return this.value
  }
}

/**
 * A constant text value.
 */
class ValueText extends ExprValue {
  /**
   * Construct.
   * @param {string} value `MISSING` or a numeric value.
   */
  constructor (value) {
    util.check((value === util.MISSING) || (typeof value === 'string'),
               `String value "${value}" must be missing or string`)
    super(FAMILY, 'text', value)
  }

  /**
   * Produce the constant text value.
   * @param row The row.
   * @param i The row number.
   * @returns The constant text value.
   */
  run (row, i) {
    return this.value
  }
}

/**
 * Sample an exponential distribution.
 */
class ValueExponential extends ExprValue {
  /**
   * Construct.
   * @param {number} rate The rate parameter of the exponential distribution.
   */
  constructor (rate) {
    util.check((typeof rate === 'number') && (rate > 0),
               `Rate "${rate}" must be positive number`)
    super(FAMILY, 'exponential', rate)
    this.generator = random.exponential(this.value)
  }

  /**
   * Produce a sample from the exponential distribution.
   * @param row The row.
   * @param i The row number.
   * @returns A sample from the distribution.
   */
  run (row, i) {
    return this.generator()
  }
}

/**
 * Sample a normal distribution.
 */
class ValueNormal extends ExprBase {
  /**
   * Construct.
   * @param {number} mean The mean of the distribution.
   * @param {number} stdDev The standard deviation of the distribution.
   */
  constructor (mean, stdDev) {
    util.check(typeof mean === 'number',
               `Mean "${mean}" must be a number`)
    util.check((typeof stdDev === 'number') && (stdDev >= 0),
               `Standard deviation "${stdDev}" must be a non-negative number`)
    super(FAMILY, 'normal')
    this.mean = mean
    this.stdDev = stdDev
    this.generator = random.normal(this.mean, this.stdDev)
  }

  /**
   * Equal to other normal distributions with the same mean and standard deviation.
   * @param other The other object.
   * @returns Equality.
   */
  equal (other) {
    return (other instanceof ValueNormal) &&
      (this.mean === other.mean) &&
      (this.stdDev === other.stdDev)
  }

  /**
   * Produce a sample from the normal distribution.
   * @param row The row.
   * @param i The row number.
   * @returns A sample from the distribution.
   */
  run (row, i) {
    return this.generator()
  }
}

/**
 * Sample a uniform distribution.
 */
class ValueUniform extends ExprBase {
  /**
   * Construct.
   * @param {number} low The low end of the distribution (inclusive).
   * @param {number} high The high end of the distribution (inclusive).
   */
  constructor (low, high) {
    util.check(typeof low === 'number',
               `Low end "${low}" must be a number`)
    util.check(typeof high === 'number',
               `High end "${high}" must be a number`)
    util.check(low <= high,
               `Low end "${low}" must not be greater than high end "${high}"`)
    super(FAMILY, 'uniform')
    this.low = low
    this.high = high
    this.generator = random.uniform(this.low, this.high)
  }

  /**
   * Equal to other uniform distributions with the same range.
   * @param other The other object.
   * @returns Equality.
   */
  equal (other) {
    return (other instanceof ValueUniform) &&
      (this.low === other.low) &&
      (this.high === other.high)
  }

  /**
   * Produce a sample from the uniform distribution.
   * @param row The row.
   * @param i The row number.
   * @returns A sample from the distribution.
   */
  run (row, i) {
    return this.generator()
  }
}

module.exports = {
  FAMILY: FAMILY,
  absent: ValueAbsent,
  rownum: ValueRowNum,
  column: ValueColumn,
  datetime: ValueDatetime,
  logical: ValueLogical,
  number: ValueNumber,
  text: ValueText,
  exponential: ValueExponential,
  normal: ValueNormal,
  uniform: ValueUniform
}
