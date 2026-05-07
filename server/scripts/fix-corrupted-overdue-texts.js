const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("kanban.sqlite");

const fixes = [
  {
    id: 13,
    name: "Починить фильтр просроченных задач",
    description: "Фильтр должен корректно выделять задачи с прошедшим дедлайном в канбане.",
  },
  {
    id: 14,
    name: "Обновить уведомления о дедлайнах",
    description: "Добавить более заметное предупреждение за день до дедлайна и при просрочке.",
  },
  {
    id: 15,
    name: "Проверить мобильный экран дедлайнов",
    description: "Проверить отображение просроченных задач на мобильных устройствах.",
  },
  {
    id: 16,
    name: "Сверить отчёт по просроченным задачам",
    description: "Сравнить статистику просрочки в дашборде и в API-ответе.",
  },
  {
    id: 17,
    name: "Проверить экспорт отчёта по задачам",
    description: "Экспорт должен учитывать только активные фильтры в таблице.",
  },
  {
    id: 18,
    name: "Обновить статусы в доске после drag-and-drop",
    description: "После перетаскивания карточка и счётчики должны обновляться сразу.",
  },
  {
    id: 19,
    name: "Сверить доступы менеджера в проекте",
    description: "Менеджер должен видеть все задачи и комментарии в рамках проекта.",
  },
  {
    id: 20,
    name: "Проверить уведомления о просрочке в ленте",
    description: "В ленте активности должны отображаться новые просроченные задачи.",
  },
];

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function runCallback(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function main() {
  await run("BEGIN TRANSACTION");
  try {
    for (const item of fixes) {
      await run(
        "UPDATE tasks SET name = ?, description = ?, updatedAt = datetime('now') WHERE id = ?",
        [item.name, item.description, item.id]
      );
    }
    await run("COMMIT");
  } catch (error) {
    await run("ROLLBACK");
    throw error;
  }

  const checkRows = await all(
    "SELECT id, name, hex(name) AS nameHex FROM tasks WHERE id BETWEEN 13 AND 20 ORDER BY id"
  );
  console.log(JSON.stringify(checkRows, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.close());
