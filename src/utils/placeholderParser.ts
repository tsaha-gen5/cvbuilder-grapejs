import React from 'react';

interface UserAccount {
  [key: string]: any;
}

export const replacePlaceholders = (content: string, user_account: UserAccount): string => {
  return content.replace(/{(\w+)}/g, (match, key) => {
    const lowerCaseKey = key.toLowerCase();
    return user_account[lowerCaseKey] !== undefined ? user_account[lowerCaseKey] : match;
  });
};

export const func_parse = async (content: string, user_account: UserAccount): Promise<string> => {
  if (content !== "" && user_account) {
    // Replace placeholders in the content with values from user_account
    const updatedContent = replacePlaceholders(content, user_account);
    return updatedContent;
  } else {
    return "unable to parse the content";
  }
};

interface PlaceholderParserProps {
  content: string;
  user_account: UserAccount;
  onParsed: (parsedContent: string) => void;
}

const PlaceholderParser: React.FC<PlaceholderParserProps> = ({ content, user_account, onParsed }) => {
  React.useEffect(() => {
    const parseContent = async () => {
      const parsedContent = await func_parse(content, user_account);
      if (onParsed) {
        onParsed(parsedContent);
      }
    };

    parseContent();
  }, [content, user_account, onParsed]);

  return null; // This component doesn't render anything
};

export default PlaceholderParser;
