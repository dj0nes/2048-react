import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Button from './button'

function Overlay(props) {
    const Overlay = styled.div`
        display: ${props.active ? 'block' : 'none'}
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 110;
        background: rgba(238, 228, 218, 0.75);
        text-align: center;
        animation: fade-in 800ms ease 1200ms;
        animation-fill-mode: both;`
    const Title = styled.h2`
          font-size: 5em;
          text-align: center;`

    return (
        <Overlay>
            <Title>{props.title}</Title>
            <p>{props.message}</p>
            <Button action={props.action} text={props.button_text}> </Button>
        </Overlay>
    )
}

Overlay.propTypes = {
    active: PropTypes.bool,
    title: PropTypes.string,
    message: PropTypes.string,
    button_text: PropTypes.string,
    action: PropTypes.func
}

export default Overlay