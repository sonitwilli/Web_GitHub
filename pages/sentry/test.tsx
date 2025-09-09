import { sendMsgSentry } from '@/lib/utils/sentry';

export default function SentryTestPage() {
  return (
    <div className="p-2 flex flex-col gap-2">
      <div>
        <button
          onClick={() => {
            throw new Error(`DebugLog ${new Date().toISOString()}`);
          }}
          className="bg-red-600 text-white px-4 py-1 rounded-xl"
        >
          Throw Error
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            sendMsgSentry({
              message: `Console.log ${new Date().toISOString()}`,
            });
          }}
          className="bg-blue-700 text-white px-4 py-1 rounded-xl"
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
