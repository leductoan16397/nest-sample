import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ConfigurationType } from 'src/common/config/configuration';
import { SERVICE_NAME } from 'src/common/constant/constant';

const telegramBotUrl = 'https://api.telegram.org/bot';

@Injectable()
export class TelegramBotService {
  private readonly _botToken = this.configService.get<ConfigurationType['botToken']>('botToken') || '';
  private readonly _devopsChatGroupId =
    this.configService.get<ConfigurationType['devopsChatGroupId']>('devopsChatGroupId') || '';
  private readonly _telegramBotUrl = telegramBotUrl;

  constructor(private readonly configService: ConfigService<ConfigurationType, true>) {}

  /**
   * Sends a message to the devops chat group via Telegram bot.
   * @param {Object} options - The options for sending the message.
   * @param {string} options.message - The message to be sent.
   * @returns {Promise<Object>} - A promise that resolves to the response from the Telegram API.
   */
  sendMessageToDevops({ message }: { message: string }): void {
    // Send a POST request to the Telegram API to send a message.
    axios
      .post(`${this._telegramBotUrl}${this._botToken}/sendMessage`, {
        chat_id: this._devopsChatGroupId, // The ID of the devops chat group.
        text: `${process.env.NODE_ENV} | ${SERVICE_NAME} | \n ${message.replaceAll('\\n', '\n')}`, // The message to be sent.
      })
      .catch((error) => {
        if (error instanceof Error) {
          // Log the error if there is any.
          console.log(`🚀 ~ TelegramService ~ sendMessageToDevops ~ error:`, error.message || error);
        }
      });
  }
}

export function sendMessageToDevops({ message }: { message: string }): void {
  // Send a POST request to the Telegram API to send a message.
  axios
    .post(`${telegramBotUrl}${process.env.TELEGRAM_BOT_TOKEN || ''}/sendMessage`, {
      chat_id: process.env.TELEGRAM_DEVOPS_CHAT_GROUP_ID || '', // The ID of the devops chat group.
      text: `${process.env.NODE_ENV} | ${SERVICE_NAME} | \n ${message.replaceAll('\\n', '\n')}`.slice(0, 4096), // The message to be sent.
    })
    .catch((error) => {
      if (error instanceof Error) {
        // Log the error if there is any.
        console.log(`🚀 ~ TelegramService ~ sendMessageToDevops ~ error:`, error.message || error);
      }
    });
}
