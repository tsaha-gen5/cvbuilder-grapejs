import React from 'react';
import parse, { domToReact } from 'html-react-parser';
import templateData from '../../public/modelscv/template1.json';
import Hero, { Container, Title, Subtitle, Button, HeroImage } from '../grapesjs-core/Hero';

// This mapping associates HTML classes and IDs with React components
const componentMapping = {
    'resumecv-layout': Hero,
    'resumecv-content': Container,
    'resumecv-content-top': Title,
    'resumecv-top-info': Subtitle,
    'resumecv-button': Button,  // Example, adjust based on actual HTML and needs
    'resumecv-ava': HeroImage  // Assume the image inside `resumecv-box-ava` is a hero image
};

const extractProps = (attribs) => {
    const props = {};
    if (attribs) {
        for (const attr in attribs) {
            if (attribs.hasOwnProperty(attr)) {
                // Convert HTML class attribute to className in React
                if (attr === 'class') {
                    props['className'] = attribs[attr];
                } else {
                    props[attr] = attribs[attr];
                }
            }
        }
    }
    return props;
};

const options = {
    replace: ({ attribs, name, children }) => {
        if (!attribs) return;

        // Find a component based on class or id
        const componentKey = Object.keys(componentMapping).find(key =>
            attribs.class?.includes(key) || attribs.id === key
        );

        if (componentKey) {
            const Component = componentMapping[componentKey];
            const props = extractProps(attribs);
            return <Component {...props}>{domToReact(children, options)}</Component>;
        } else if (name === 'span') {
            // Specifically handle spans
            const props = extractProps(attribs);
            return <span {...props}>{domToReact(children, options)}</span>;
        }
    }
};

const DynamicCV = () => {
    const content = templateData.content;
    return (
        <div className="cv-container">
            {parse(content, options)}
        </div>
    );
};

export default DynamicCV;
