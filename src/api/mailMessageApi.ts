import { apiClient } from './client';

export type MailMessageDto = {
  idx?: number | string;
  attend_code?: string;
  attendCode?: string;
  detail_code?: string;
  detailCode?: string;
  mail_message?: string;
  mailMessage?: string;
  etc?: string;
  reg_date?: string;
  regDate?: string;
};

export type MailMessageListDto = {
  mailmessagelist?: MailMessageDto[];
  mailMessageList?: MailMessageDto[];
};

export type MailMessagePayload = {
  idx?: number | string;
  attend_code: string;
  mail_message: string;
  etc: string;
};

const wrapMailMessage = (payload: MailMessagePayload) => ({
  mailmessageinfo: payload,
});

export const mailMessageApi = {
  select() {
    return apiClient<MailMessageListDto>('/api/attend/manager/mail/list', {
      method: 'POST',
    });
  },

  insert(payload: MailMessagePayload) {
    return apiClient<string>('/api/attend/manager/mail/add', {
      method: 'POST',
      body: wrapMailMessage(payload),
    });
  },

  modify(payload: MailMessagePayload) {
    return apiClient<string>('/api/attend/manager/mail/modify', {
      method: 'POST',
      body: wrapMailMessage(payload),
    });
  },

  delete(idx: string) {
    return apiClient<string>(`/api/attend/manager/mail/delete/${encodeURIComponent(idx)}`, {
      method: 'POST',
    });
  },
};
