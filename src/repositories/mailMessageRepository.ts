import {
  mailMessageApi,
  type MailMessageDto,
  type MailMessagePayload,
} from '@/api/mailMessageApi';
import type { MailMessage } from '@/types/domain';

type MailMessageRepository = {
  select(): Promise<MailMessage[]>;
  insert(message: MailMessage): Promise<void>;
  modify(message: MailMessage): Promise<void>;
  delete(id: string): Promise<void>;
};

const adaptDtoToMailMessage = (dto: MailMessageDto): MailMessage => ({
  id: String(dto.idx ?? ''),
  attendCode: dto.attend_code ?? dto.attendCode ?? dto.detail_code ?? dto.detailCode ?? '',
  detailCode: dto.detail_code ?? dto.detailCode ?? dto.attend_code ?? dto.attendCode ?? '',
  message: dto.mail_message ?? dto.mailMessage ?? '',
  etc: dto.etc ?? '',
  regDate: dto.reg_date ?? dto.regDate ?? '',
});

const adaptMailMessageToPayload = (message: MailMessage): MailMessagePayload => ({
  ...(message.id ? { idx: message.id } : {}),
  attend_code: message.attendCode,
  mail_message: message.message,
  etc: message.etc ?? '',
});

export const mailMessageRepository: MailMessageRepository = {
  async select() {
    const dto = await mailMessageApi.select();
    return (dto.mailmessagelist ?? dto.mailMessageList ?? [])
      .map(adaptDtoToMailMessage)
      .filter((message) => message.attendCode);
  },

  async insert(message) {
    await mailMessageApi.insert(adaptMailMessageToPayload(message));
  },

  async modify(message) {
    await mailMessageApi.modify(adaptMailMessageToPayload(message));
  },

  async delete(id) {
    await mailMessageApi.delete(id);
  },
};
