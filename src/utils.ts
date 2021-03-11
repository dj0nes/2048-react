import React, { useState, useRef } from 'react'

// source: https://stackoverflow.com/a/62829855
export const useReferredState = <T>(
    initialValue: T = undefined
): [T, React.MutableRefObject<T>, React.Dispatch<T>] => {
    const [state, setState] = useState<T>(initialValue)
    const reference = useRef<T>(state)

    const setReferredState = (value) => {
        reference.current = value
        setState(value)
    }

    return [state, reference, setReferredState]
}

export function range(start = 0, stop, step = 1) {
    if(stop === undefined) {
        // then this was passed only one parameter, which should be interpreted as the stop value
        stop = start
        start = 0
    }

    let result = []
    let i = start
    while(i < stop) {
        result.push(i)
        i += step
    }

    return result
}