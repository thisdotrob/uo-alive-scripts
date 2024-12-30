import Journal from '../globals/journal';

export default <T extends { [k: string]: string }>(messages: T): keyof T => {
  const keys = Object.keys(messages);
  const values = keys.map(k => messages[k]);
  const value = Journal.waitForTextAny(values, "System", 60000);
  return keys.find(k => messages[k] === value) as keyof T;
};
