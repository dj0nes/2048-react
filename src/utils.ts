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