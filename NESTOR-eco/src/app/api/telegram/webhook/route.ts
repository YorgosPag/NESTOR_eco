import { NextResponse, type NextRequest } from 'next/server';
import axios from 'axios';
import { processMessage } from '@/ai/flows/message-processor';
import type { FileInfo } from '@/ai/flows/schemas';

async function downloadFile(fileUrl: string): Promise<{ dataUri: string; mimeType?: string }> {
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');
  const mimeType = response.headers['content-type'];
  const base64 = buffer.toString('base64');
  return { dataUri: `data:${mimeType};base64,${base64}`, mimeType };
}

export async function POST(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('Telegram Bot Token is not configured.');
    return new NextResponse('Error: Telegram Bot not configured', { status: 500 });
  }
  const TELEGRAM_API = `https://api.telegram.org/bot${token}`;

  async function sendMessage(chatId: number, text: string) {
    return axios.post(`${TELEGRAM_API}/sendMessage`, { chat_id: chatId, text });
  }

  async function getFileLink(fileId: string): Promise<string> {
    const res = await axios.get(`${TELEGRAM_API}/getFile?file_id=${fileId}`);
    return `https://api.telegram.org/file/bot${token}/${res.data.result.file_path}`;
  }

  try {
    const body = await req.json();
    console.log('Received Telegram update:', JSON.stringify(body, null, 2));

    const message = body.message;
    if (!message || !message.chat?.id) {
      return NextResponse.json({ status: 'ok, no valid message or chat id' });
    }

    const chatId = message.chat.id;
    const messageText = message.text || message.caption || '';
    let fileInfo: FileInfo | undefined;

    if (message.document) {
      try {
        const fileId = message.document.file_id;
        const fileLink = await getFileLink(fileId);
        const { dataUri, mimeType } = await downloadFile(fileLink);
        fileInfo = {
          dataUri,
          name: message.document.file_name || 'telegram-file',
          mimeType: mimeType || 'application/octet-stream',
        };
        console.log(`Processing document: ${fileInfo.name}`);
      } catch (fileError) {
        console.error('Error processing Telegram document:', fileError);
        await sendMessage(chatId, 'Δυστυχώς, υπήρξε ένα πρόβλημα με τη λήψη του αρχείου σας.');
        return NextResponse.json({ status: 'file error' });
      }
    }

    if (!messageText && !fileInfo) {
      return NextResponse.json({ status: 'ok, nothing to process' });
    }

    const aiResponse = await processMessage({ messageText, fileInfo });

    let responseText = aiResponse.responseText;
    if (aiResponse.tags && aiResponse.tags.length > 0) {
      responseText += `\n\nΠροτεινόμενες Ετικέτες: ${aiResponse.tags.join(', ')}`;
    }
    if (aiResponse.forwardingRecommendation) {
      responseText += `\nΠρόταση Προώθησης: ${aiResponse.forwardingRecommendation}`;
    }

    if (responseText) {
      await sendMessage(chatId, responseText);
    }

    return NextResponse.json({ status: 'ok', response: aiResponse });
  } catch (error) {
    console.error('Error handling Telegram webhook:', error);
    return new NextResponse('Error handling webhook', { status: 500 });
  }
}
