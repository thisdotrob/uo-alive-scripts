import Client from './globals/client';

import { TextColour } from '../types/TextColour';

export const headMsg = (data: any, colour: TextColour = TextColour.Red) => Client.headMsg(`${data}`, player, colour);
