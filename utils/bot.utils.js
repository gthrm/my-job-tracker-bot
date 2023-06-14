const {
  Telegraf, Scenes, session, Markup,
} = require('telegraf');
const { base } = require('./airtable.utils');
const { logger } = require('./logger.utils');
const { statuses, statusesObj } = require('../const/statuses.cont');
const { getPrettyDate } = require('./time.utils');

require('dotenv').config();

const createInlineKeyboard = (records) => {
  const cancelButton = { id: 'cancel', label: 'Cancel' };
  const updatedRecords = [...records, cancelButton];
  return Markup.inlineKeyboard(
    updatedRecords.map((record) => [
      Markup.button.callback(record.id === cancelButton.id ? cancelButton.label : record.get('Company'), record.id),
    ]),
  );
};

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply(
  'Welcome to Job Tracker Bot! To add a new job for tracking, type /addjob.',
));
bot.help((ctx) => ctx.reply(
  'Welcome to Job Tracker Bot! To add a new job for tracking, type /addjob.',
));
bot.on('sticker', (ctx) => ctx.reply('👍'));

// addJob
const addJob = new Scenes.BaseScene('addJob');
addJob.enter((ctx) => ctx.reply('Please enter the company name: (type /cancel to cancel the operation)'));
addJob.command('cancel', (ctx) => {
  ctx.reply('Operation cancelled');
  ctx.scene.leave();
});
addJob.on('text', (ctx) => {
  if (!ctx.scene.session.company) {
    ctx.scene.session.company = ctx.message.text;
    ctx.reply('Now, please enter the job link: (type /cancel to cancel the operation)');
  } else {
    base(process.env.BASE_NAME).create(
      {
        Company: ctx.scene.session.company,
        'Job link': ctx.message.text,
        Status: statusesObj.CV_SENT,
        User: ctx.from.username,
        'User ID': String(ctx.from.id),
      },
      (err, record) => {
        if (err) {
          logger.error({ err, record });
          return;
        }

        ctx.reply('Job added successfully!');
        ctx.scene.leave();
      },
    );
  }
});

// updateStatus
const updateStatus = new Scenes.BaseScene('updateStatus');

updateStatus.enter(async (ctx) => {
  const records = await base(process.env.BASE_NAME)
    .select({
      filterByFormula: `{User ID} = '${String(ctx.from.id)}'`,
    })
    .firstPage(); // Get all records

  // Create a keyboard with a button for each record
  const keyboard = createInlineKeyboard(records);
  await ctx.reply('Please select a job:', keyboard);
});

updateStatus.action('cancel', (ctx) => {
  ctx.reply('Operation cancelled');
  ctx.scene.leave();
});

updateStatus.action(/.*/, async (ctx) => {
  // Get the record ID from the callback data
  ctx.scene.session.recordId = ctx.callbackQuery.data;

  await ctx.reply(
    'Please select the new status:',
    Markup.keyboard(statuses.map((status) => ({ text: status })))
      .oneTime()
      .resize(),
  );
});

updateStatus.command('empty', (ctx) => {
  // Update the record in Airtable
  base(process.env.BASE_NAME).update(
    ctx.scene.session.recordId,
    {
      Status: ctx.scene.session.newStatus,
      'Status Update': 'empty',
    },
    (err, record) => {
      if (err) {
        logger.error(err, record);
        return;
      }
      ctx.reply('Status updated successfully!');
      ctx.scene.leave();
    },
  );
});

updateStatus.on('text', (ctx) => {
  if (!ctx.scene.session.newStatus) {
    // Check if the selected status is valid
    if (statuses.includes(ctx.message.text)) {
      ctx.scene.session.newStatus = ctx.message.text;
      ctx.reply(
        "Please enter the status update: (or press /empty if you don't want to provide an update)",
      );
    } else {
      ctx.reply('Invalid status. Please select a valid status.');
    }
  } else {
    // Update the record in Airtable
    base(process.env.BASE_NAME).update(
      ctx.scene.session.recordId,
      {
        Status: ctx.scene.session.newStatus,
        'Status Update': ctx.message.text,
      },
      (err, record) => {
        if (err) {
          logger.error(err, record);
          return;
        }
        ctx.reply('Status updated successfully!');
        ctx.scene.leave();
      },
    );
  }
});

// getInfo
const getInfo = new Scenes.BaseScene('getInfo');

getInfo.enter(async (ctx) => {
  const records = await base(process.env.BASE_NAME)
    .select({
      filterByFormula: `{User ID} = '${String(ctx.from.id)}'`,
    })
    .firstPage(); // Get all records

  // Create a keyboard with a button for each record
  const keyboard = createInlineKeyboard(records);
  await ctx.reply('Please select a job:', keyboard);
});
getInfo.action('cancel', (ctx) => {
  ctx.reply('Operation cancelled');
  ctx.scene.leave();
});

getInfo.action(/.*/, async (ctx) => {
  // Get the record ID from the callback data
  const recordId = ctx.callbackQuery.data;

  // Fetch the record from Airtable
  const record = await base(process.env.BASE_NAME).find(recordId);

  if (record) {
    // eslint-disable-next-line max-len
    ctx.reply(
      `Company: ${record.get('Company')}\nJob link: ${record.get(
        'Job link',
      )}\nStatus: ${record.get('Status')}\nStatus Update: ${record.get('Status Update') || '-'
      }\nCreated at: ${getPrettyDate(
        record.get('Created At'),
      )}\nUpdated At: ${getPrettyDate(record.get('Updated At'))}`,
    );
  } else {
    ctx.reply('Record not found.');
  }

  ctx.scene.leave();
});

// deleteJob
const deleteJob = new Scenes.BaseScene('deleteJob');

deleteJob.enter(async (ctx) => {
  const records = await base(process.env.BASE_NAME)
    .select({
      filterByFormula: `{User ID} = '${String(ctx.from.id)}'`,
    })
    .firstPage(); // Get all records

  // Create a keyboard with a button for each record
  const keyboard = createInlineKeyboard(records);

  await ctx.reply('Please select a job to delete:', keyboard);
});

deleteJob.action('cancel', (ctx) => {
  ctx.reply('Operation cancelled');
  ctx.scene.leave();
});

deleteJob.action(/.*/, async (ctx) => {
  // Get the record ID from the callback data
  const recordId = ctx.callbackQuery.data;

  // Delete the record from Airtable
  base(process.env.BASE_NAME).destroy(recordId, (err, deletedRecord) => {
    if (err) {
      logger.error(err);
      return;
    }
    ctx.reply(
      `Job ${deletedRecord.get('Company')} has been successfully deleted.`,
    );
    ctx.scene.leave();
  });
});

const stage = new Scenes.Stage([addJob, updateStatus, getInfo, deleteJob]);

bot.use(session());
bot.use(stage.middleware());

// Commands
bot.telegram.setMyCommands([
  { command: '/start', description: 'Start interaction with bot' },
  { command: '/addjob', description: 'Add a new job application' },
  {
    command: '/update_status',
    description: 'Update status of a job application',
  },
  { command: '/get_info', description: 'Get information of a job application' },
  { command: '/delete_job', description: 'Delete a job application' },
]);

bot.command('addjob', (ctx) => ctx.scene.enter('addJob'));
bot.command('update_status', (ctx) => ctx.scene.enter('updateStatus'));
bot.command('get_info', (ctx) => ctx.scene.enter('getInfo'));
bot.command('delete_job', (ctx) => ctx.scene.enter('deleteJob'));

bot.catch((err, ctx) => {
  logger.error(`Ooops, encountered an error for ${ctx.updateType}`, err);
  bot.telegram.sendMessage(
    process.env.CHANNEL_ID,
    `An error occurred for ${ctx.updateType}: ${err.message}`,
  );
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

process.on('uncaughtException', (err) => {
  logger.error('Caught exception: ', err);
  bot.telegram.sendMessage(
    process.env.CHANNEL_ID,
    `An uncaught exception occurred: ${err.message}`,
  );
});

module.exports = {
  bot,
};
