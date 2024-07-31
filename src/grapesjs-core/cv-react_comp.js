import React from 'react';
import Hero, { Container, HeroImage, Title, Subtitle, Button } from "./Hero";

// Define React components corresponding to sections of the HTML resume/CV template.
const ResumeSection = ({ children, id }) => <div id={id}>{children}</div>;
const ResumeBlock = ({ title, children }) => (
  <div className="resumecv-block">
    <p className="head"><span>{title}</span></p>
    {children}
  </div>
);

export default (editor) => {
  // Register custom components in the editor for various parts of the resume.
  editor.Components.addType("resume-section", {
    model: {
      defaults: {
        component: ResumeSection,
        tagName: 'div',
        stylable: true,
        editable: true,
        draggable: true,
        droppable: true,
        attributes: { class: 'resume-section' }
      },
    },
    isComponent: (el) => el.className === "resume-section",
  });

  editor.Components.addType("resume-block", {
    model: {
      defaults: {
        component: ResumeBlock,
        tagName: 'div',
        stylable: true,
        editable: true,
        draggable: true,
        droppable: true,
        attributes: { class: 'resume-block' }
      },
    },
    isComponent: (el) => el.className === "resume-block",
  });

  // Register other existing components
  // The registration for existing components like Hero, Container, etc., stays the same
  // Below is an example of how to register the Hero component, similar registrations for others.
  editor.Components.addType("Hero", {
    extend: "react-component",
    model: {
      defaults: {
        component: Hero,
        components: [
          {
            type: "Container",
            components: [
              {
                type: "Title",
                content: "Get it done in One Unified workspace",
              },
              {
                type: "Subtitle",
                content:
                  "Manage tasks, write notes, organize projects and collaborate easily. Taskade is the fastest way to get work done",
              },
              { type: "Button" },
            ],
          },
          { type: "HeroImage" },
        ],
        stylable: true,
        editable: true,
        draggable: true,
        droppable: true,
        attributes: {
          editable: "true",
        },
      },
    },
    isComponent: (el) => el.tagName === "HERO",
  });

  // Initialize the block manager with the template
  editor.BlockManager.add("resume-section", {
    label: "Resume Section",
    content: `<ResumeSection></ResumeSection>`,
    category: "Sections",
  });

  editor.BlockManager.add("resume-block", {
    label: "Resume Block",
    content: {
      type: "resume-block",
      content: "<ResumeBlock title='Skill'><div>Skills content</div></ResumeBlock>"
    },
    category: "Blocks",
  });
};
