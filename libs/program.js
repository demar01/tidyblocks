'use strict'

const util = require('./util')
const DataFrame = require('./dataframe')
const Env = require('./env')
const Pipeline = require('./pipeline')

/**
 * Manage an entire program.
 */
class Program {
  /**
   * Create a runnable program with some pipelines.
   * The environment is filled in when the program runs.
   */
  constructor (...pipelines) {
    this.env = null
    this.pipelines = []
    this.queue = []
    this.waiting = new Map()

    pipelines.forEach(pipeline => this.register(pipeline))
  }

  /**
   * Check equality with another program (primarily for testing).
   */
  equal (other) {
    util.check(other instanceof Program,
               `Can only compare programs to programs`)
    return (this.pipelines.length === other.pipelines.length) &&
      this.pipelines.every((pipeline, i) => pipeline.equal(other.pipelines[i]))
  }

  /**
   * Notify the manager that a named pipeline has finished running.
   * This enqueues pipeline functions to run if their dependencies are satisfied.
   * @param {string} label Name of the pipeline that just completed.
   * @param {Object} data The DataFrame produced by the pipeline.
   */
  notify (label, data) {
    util.check(label && (typeof label === 'string'),
               `Cannot notify with empty label`)
    util.check(data instanceof DataFrame,
               `Data must be a dataframe`)
    util.check(this.env instanceof Env,
               `Program must have non-null environment when notifying`)
    this.env.setResult(label, data)
    const toRemove = []
    this.waiting.forEach((dependencies, pipeline) => {
      dependencies.delete(label)
      if (dependencies.size === 0) {
        this.queue.push(pipeline)
        toRemove.push(pipeline)
      }
    })
    toRemove.forEach(pipeline => this.waiting.delete(pipeline))
  }

  /**
   * Register a new pipeline function with what it depends on and what it produces.
   * @param {Pipeline} pipeline What to register.
   */
  register (pipeline) {
    util.check(pipeline instanceof Pipeline,
               `Pipelines must be instances of the Pipeline class`)
    this.pipelines.push(pipeline)
    const requires = pipeline.requires()
    if (requires.length === 0) {
      this.queue.push(pipeline)
    }
    else {
      this.waiting.set(pipeline, new Set(requires))
    }
  }

  /**
   * Run all pipelines in an order that respects dependencies within an environment.
   * This depends on `notify` to add pipelines to the queue.
   */
  run (env) {
    this.env = env
    try {
      while (this.queue.length > 0) {
        const pipeline = this.queue.shift()
        const {label, data} = pipeline.run(this.env)
        if (label) {
          this.notify(label, data)
        }
      }
    }
    catch (err) {
      this.env.appendError(`${err.message}: ${err.stack}`)
    }
  }
}

/**
 * Indicate that persisted JSON is program.
 */
Program.FAMILY = '@program'

module.exports = Program
