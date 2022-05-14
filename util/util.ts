export function isObject(item: unknown) {
   return item && typeof item === 'object' && !Array.isArray(item)
}

export function mergeDeep(target: object, ...sources: Array<object>) {
   if (!sources.length) return target
   const source = sources.shift()

   if (isObject(target) && isObject(source)) {
      for (const key in source) {
         if (isObject(source[key])) {
            if (!target[key]) {
               Object.assign(target, { [key]: {} })
            }
            mergeDeep(target[key], source[key])
         } else {
            Object.assign(target, { [key]: source[key] })
         }
      }
   }

   return mergeDeep(target, ...sources)
}
 
 export function forArr<A, V>(array: readonly A[], onLoop: (item: A, i: number) => V, breakOnReturn = true): V {
   let res
   for (let i = 0; i < array.length; i++) {
      res = onLoop(array[i], i)
      if (res && breakOnReturn) {
         return res
      }
   }
   return res as V
}

export async function forArrAsync<A>(array: readonly A[], onLoop: (item: A, i: number) => Promise<unknown>, breakOnReturn = true): Promise<unknown> {
   for (let i = 0; i < array.length; i++) {
      const res = await onLoop(array[i], i)
      if (res && breakOnReturn) {
         return res
      }
   }
}

export function forMap<K, V>(map: Map<K, V>, onLoop: (item: V, key: K, i: number) => unknown, breakOnReturn = true): unknown {
   const keys: Array<K> = Array.from(map.keys())
   for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const item = map.get(key) as V
      const res = onLoop(item, key, i)
      if (res && breakOnReturn) {
         return res
      }
   }
}

export function forObj<O extends Record<keyof O, unknown>, V>(obj: O, onLoop: (item: O[keyof O], key: keyof O, i: number) => V, breakOnReturn = true): V {
   const keys = Object.keys(obj) as Array<keyof O>
   let res
   for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      res = onLoop(obj[key], key, i)
      if (res && breakOnReturn) {
         return res
      }
   }
   return res as V
}

export async function forObjAsync<O extends Record<keyof O, unknown>, V>(obj: O, onLoop: (item: O[keyof O], key: keyof O, i: number) => Promise<V>, breakOnReturn = true): Promise<V> {
   const keys = Object.keys(obj) as Array<keyof O>
   let res
   for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      res = await onLoop(obj[key as keyof O], key, i)
      if (res && breakOnReturn) {
         return res
      }
   }
   return res as V
}

export function forRange(from: number, to: number, onLoop: (i: number) => unknown, breakOnReturn = true): unknown {
   for (let i = from; i <= to; i++) {
      const res = onLoop(i)
      if (res && breakOnReturn) {
         return res
      }
   }
}

export function coalesceArr<A, V>(array: Array<A>, initial: V, onLoop: (item: A, v: V, i: number) => V, then = (v: V): V => v): V {
   let value = initial
   for (let i = 0; i < array.length; i++) {
      value = onLoop(array[i], value, i)
   }
   return then ? then(value) : value
}

export function coalesceObj<O, K extends string, V>(obj: Record<string, O>, initial: V, onLoop: (item: O, v: V, key: K, i: number) => V, then = (v: V): V => v): V {
   const keys = Object.keys(obj)
   let value = initial
   for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      value = onLoop(obj[key as K], value, key as K, i)
   }
   return then ? then(value) : value
}

export function clamp(v: number, min: number, max: number, snapPoint = 0) {
   return v - (max - min) * snapPoint < min ? min : v + (max - min) * snapPoint > max ? max : v
}

export function clampAny<T extends number | string | null>(v: T, min: T, max: T) {
   if (v === null) return null
   return !min && !max ? v : !min ? (v > max ? max : v) : !max ? (v < min ? min : v) : v < min ? min : v > max ? max : v
}

export function snapAll(v: number, increments: number, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
   return Math.round(clamp(v, min, max, 0.5 / increments) * increments) / increments
}

export function generateRange(from: number, to: number, interval = 1) {
   const a = []
   for (let i = from; i <= to; i += interval) {
      a.push(i)
   }
   return a
}
