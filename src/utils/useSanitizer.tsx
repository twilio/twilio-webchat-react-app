import { useState } from "react";
import validator from "validator";

const BLACKLIST_CHARS_FOR_CHAT_INPUT = '<>;:&/"\'';
const BLACKLIST_CHARS_FOR_PRE_ENGAGEMENT_FORM_NAME_FIELD = '<>;:&/"';

export const useSanitizer = () => {
  const [userInput, setUserInput] = useState('');
  const onUserInputSubmit = (event: string, isNameField?: boolean): string => {
    const escapedUserInput = isNameField ? validator.blacklist(event, BLACKLIST_CHARS_FOR_PRE_ENGAGEMENT_FORM_NAME_FIELD) :
                              validator.blacklist(event, BLACKLIST_CHARS_FOR_CHAT_INPUT);
    setUserInput(escapedUserInput);
    return escapedUserInput;
  };

  return {
    userInput,
    onUserInputSubmit
  };
};
