import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

function Button(props) {
    const Button = styled.button`
        display: inline-block;
        background: #8f7a66;
        border-radius: 3px;
        text-decoration: none;
        color: #f9f6f2;`
    // line-height: 42px;
    // text-align: center;

    return (
        <Button onClick={props.action}>
            {props.text}
        </Button>
    )
}

Button.propTypes = {
    text: PropTypes.string,
    action: PropTypes.func
}

export default Button