'use strict'

const util = require('./util')
const Pipeline = require('./pipeline')

/**
 * Manage an entire program.
 */
class Program {
  /**
   * Create a runnable program with some pipelines.
   * - The environment `env` is filled in when the program runs.
   * - The list of pipelines is copied from the input arguments.
   * - The runnable queue contains pipelines that are runnable (have no
   *   unresolved dependencies).
   * - `waiting` maps sets of dependency names to runnable pipelines, and is
   *   used to keep track of pipelines that are waiting for other things to
   *   finish.
   */
  constructor (...pipelines) {
    this.env = null
    this.pipelines = []
    this.queue = []
    this.waiting = new Map()

    pipelines.forEach(pipeline => this.register(pipeline))
  }

  /**
   * Check equality with another program.
   * @param {Program} other The thing to check against.
   * @returns True or false.
   */
  equal (other) {
    util.check(other instanceof Program,
               `Can only compare programs to programs`)
    return (this.pipelines.length === other.pipelines.length) &&
      this.pipelines.every((pipeline, i) => pipeline.equal(other.pipelines[i]))
  }

  /**
   * Notify the program that a named result is now available.  This enqueues
   * pipelines for running if all of their dependencies are now satisfied.
   * @param {string} label Name of the result that was just produced.
   */
  notify (label) {
    util.check(label && (typeof label === 'string'),
               `Cannot notify with empty label`)
    // Figure out what is now runnable.
    const toRemove = []
    this.waiting.forEach((dependencies, pipeline) => {
      dependencies.delete(label)
      if (dependencies.size === 0) {
        this.queue.push(pipeline)
        toRemove.push(pipeline)
      }
    })
    // Delete things that are moving to the runnable queue _after_ the first
    // `forEach` completes because we can't safely delete while iterating.
    toRemove.forEach(pipeline => this.waiting.delete(pipeline))
  }

  /**
   * Register a pipeline. If it doesn't depend on anything, add it to the run
   * queue. If it has dependencies, add it to `waiting` instead.
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
   * Run all pipelines in an order that respects dependencies.
   * @param {Env} env The runtime environment of the program.
   */
  run (env) {
    this.env = env
    try {
      // Run until queue is empty.
      while (this.queue.length > 0) {
        const pipeline = this.queue.shift()
        const previous = new Set(this.env.results.keys())
        pipeline.run(this.env)
        Array.from(this.env.results.keys())
          .filter(key => !previous.has(key))
          .forEach(key => this.notify(key))
      }
      // Report how many things were not run.
      if (this.waiting.size > 0) {
        const unseen = new Set()
        this.waiting.forEach(keySet => {
          Array.from(keySet).forEach(key => unseen.add(key))
        })
        env.appendLog('warn', `${this.waiting.size} pipeline(s) left waiting on ${Array.from(unseen).join(', ')}`)
      }
    }
    catch (err) {
      this.env.appendLog('error', `${err.message}: ${err.stack}`)
    }
  }
}

/**
 * Indicate that persisted JSON is a program.
 */
Program.FAMILY = '@program'

module.exports = Program
