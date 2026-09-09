document.addEventListener('DOMContentLoaded', () => {
    const commandCards = [...document.querySelectorAll('.command-card')];
    const navigation = document.querySelector('.journey-nav');
    const commandOrder = [
        1, 2, 3, 4, 5, 6, 7, 17, 18, 19,
        12, 13, 14, 15, 16, 20, 21, 24, 27,
        8, 9, 10, 11, 22, 23, 25, 26, 32, 33, 34, 35, 36,
        28, 29, 30, 31, 37, 38, 39, 40, 41, 42, 43, 44, 45
    ];
    const categoryByCommandId = {
        1: 'Start here', 2: 'Start here', 3: 'Start here', 4: 'Start here', 5: 'Start here', 6: 'Start here', 7: 'Start here',
        17: 'Start here', 18: 'Start here', 19: 'Start here',
        12: 'Branches', 13: 'Branches', 14: 'Branches', 15: 'Branches', 16: 'Branches', 20: 'Branches', 21: 'Branches', 24: 'Branches', 27: 'Branches',
        8: 'Remote work', 9: 'Remote work', 10: 'Remote work', 11: 'Remote work', 22: 'Remote work', 23: 'Remote work', 25: 'Remote work', 26: 'Remote work', 32: 'Remote work', 33: 'Remote work', 34: 'Remote work', 35: 'Remote work', 36: 'Remote work',
        28: 'Recovery and releases', 29: 'Recovery and releases', 30: 'Recovery and releases', 31: 'Recovery and releases', 37: 'Recovery and releases', 38: 'Recovery and releases', 39: 'Recovery and releases', 40: 'Recovery and releases', 41: 'Recovery and releases', 42: 'Recovery and releases', 43: 'Recovery and releases', 44: 'Recovery and releases', 45: 'Recovery and releases'
    };
    const relationships = {
        'command-01': { successor: 'git status' },
        'command-03': { predecessor: 'git status', successor: 'git commit -m' },
        'command-04': { predecessor: 'git add .', successor: 'git push' },
        'command-08': { predecessor: 'git commit -m', successor: 'git fetch / git pull' },
        'command-13': { predecessor: 'git branch', successor: 'git merge' },
        'command-14': { predecessor: 'git branch', successor: 'git add .' },
        'command-15': { predecessor: 'git merge' },
        'command-16': { predecessor: 'git switch', successor: 'git branch -d' },
        'command-20': { predecessor: 'git fetch', successor: 'git rebase --continue' },
        'command-21': { predecessor: 'git rebase', successor: 'git push' },
        'command-22': { successor: 'git diff ui origin/ui / git pull' },
        'command-26': { predecessor: 'git fetch' },
        'command-28': { predecessor: 'git log', successor: 'git cherry-pick --continue' },
        'command-29': { predecessor: 'git cherry-pick' },
        'command-30': { predecessor: 'git cherry-pick' },
        'command-35': { predecessor: 'git switch -c' },
        'command-38': { predecessor: 'git tag' },
        'command-39': { predecessor: 'git tag' },
        'command-42': { successor: 'git show HEAD@{1}' },
        'command-43': { predecessor: 'git reflog' }
    };
    const dangerLevels = {
        'command-15': 'Deletes a branch — confirm it has been merged',
        'command-20': 'Rewrites history — use with care',
        'command-21': 'Continues rewritten history — use with care',
        'command-28': 'Creates a new commit — check the target branch',
        'command-30': 'Discards in-progress conflict-resolution work',
        'command-38': 'Deletes a local tag — check the release name',
        'command-39': 'Moves a tag reference — use with care'
    };
    const quizData = {
        'Start here': [
            ['Which command puts changes into the staging area?', 'git add .', ['git status', 'git add .', 'git log']],
            ['Which command shows unstaged changes?', 'git diff', ['git diff', 'git push', 'git branch']],
            ['Which command saves the staged snapshot?', 'git commit -m', ['git init', 'git commit -m', 'git clone']]
        ],
        'Branches': [
            ['Which command combines another branch into the current one?', 'git merge', ['git merge', 'git switch', 'git branch -d']],
            ['Which command creates and selects a new branch?', 'git switch -c', ['git branch', 'git switch -c', 'git rebase']],
            ['Which command replays commits onto a new base?', 'git rebase', ['git rebase', 'git log', 'git diff']]
        ],
        'Remote work': [
            ['Which command downloads remote references without changing your files?', 'git fetch', ['git pull', 'git fetch', 'git push']],
            ['Which command publishes local commits?', 'git push', ['git clone', 'git push', 'git remote -v']],
            ['Which command fetches and integrates upstream work?', 'git pull', ['git pull', 'git branch -r', 'git status -sb']]
        ],
        'Recovery and releases': [
            ['Which command cancels an in-progress cherry-pick?', 'git cherry-pick --abort', ['git cherry-pick --continue', 'git cherry-pick --abort', 'git reflog']],
            ['Which command lists local reference movements?', 'git reflog', ['git cat-file', 'git reflog', 'git tag']],
            ['Which command forcefully moves a tag?', 'git tag -f tagName', ['git tag', 'git tag -d tagName', 'git tag -f tagName']]
        ]
    };

    const action = (label, before, after, caption) => ({ type: 'action', label, before, after, caption });
    const inspection = (label, diagram, callouts, caption) => ({ type: 'inspection', label, diagram, callouts, caption });
    const branch = (name, extra = '') => `<span class="branch-row active-branch">HEAD -&gt; ${name}</span>${extra}`;
    const commit = (id, message, className = '') => `<span class="commit-node ${className}">${id}<strong>${message}</strong></span>`;
    const lane = (title, value, className = '') => `<span class="lane-box ${className}">${title}<strong>${value}</strong></span>`;

    const visualScenarios = {
        'command-01': action('Repository created', '<span class="repo-folder">project/</span><span class="repo-file">index.html</span>', '<span class="repo-folder">project/</span><span class="repo-folder git-folder">.git/</span><span class="repo-file">index.html</span>', 'git init creates the hidden repository directory.'),
        'command-02': inspection('Working tree status', branch('main'), ['HEAD points to the current branch', 'No staged changes are present', 'Working tree state is reported'], 'git status reads the repository; it does not change it.'),
        'command-03': action('Changes staged', lane('Working Directory', 'index.html') + '<span class="flow-arrow">-&gt;</span>' + lane('Staging Area', 'empty', 'muted-lane'), lane('Working Directory', 'index.html') + '<span class="flow-arrow">-&gt;</span>' + lane('Staging Area', 'index.html', 'staged-lane'), 'git add . moves selected work into the next snapshot.'),
        'command-04': action('Commit created', lane('Staging Area', 'index.html', 'staged-lane') + '<span class="flow-arrow">-&gt;</span>' + commit('HEAD', 'pending'), lane('Staging Area', 'empty', 'muted-lane') + '<span class="flow-arrow">-&gt;</span>' + commit('a4f3c1', 'Created welcome page', 'active-node'), 'git commit turns staged content into a permanent snapshot.'),
        'command-05': inspection('Detailed history', commit('a4f3c1', 'Created welcome page') + '<span class="history-line"></span>' + commit('b91d20', 'Styled page'), ['Commit ID and message', 'Author and date details', 'Parent history'], 'git log reads the detailed commit history.'),
        'command-06': inspection('Compact history', commit('a4f3c1', 'Created welcome page') + '<span class="history-line"></span>' + commit('b91d20', 'Styled page'), ['One line per commit', 'Short commit IDs', 'Newest commit first'], 'git log --oneline compresses each snapshot into one line.'),
        'command-07': inspection('All branches graph', '<span class="branch-row">main o---o</span><span class="branch-row">feature &nbsp; \\---o</span>', ['Branch pointers', 'Diverging commit line', 'Graph relationship'], 'The graph view exposes branch relationships without changing them.'),
        'command-08': action('Commits published', '<span class="repo-circle">Local<br>Repository<strong>main: a4f3c1</strong></span><span class="sync-arrow">-&gt;</span><span class="repo-circle muted-circle">Remote<br>Repository<strong>main: old</strong></span>', '<span class="repo-circle active-circle">Local<br>Repository<strong>main: a4f3c1</strong></span><span class="sync-arrow active-sync">-&gt;</span><span class="repo-circle active-circle">Remote<br>Repository<strong>main: a4f3c1</strong></span>', 'git push sends local commits to the remote branch.'),
        'command-09': action('Remote changes integrated', '<span class="repo-circle muted-circle">Remote<br>Repository<strong>new commit</strong></span><span class="sync-arrow">-&gt;</span><span class="repo-circle">Local<br>Repository<strong>main: old</strong></span>', '<span class="repo-circle active-circle">Remote<br>Repository<strong>new commit</strong></span><span class="sync-arrow active-sync">-&gt;</span><span class="repo-circle active-circle">Local<br>Repository<strong>main: updated</strong></span>', 'git pull fetches remote work and integrates it locally.'),
        'command-10': action('Repository cloned', '<span class="repo-circle active-circle">Remote<br>Repository<strong>project history</strong></span><span class="sync-arrow">-&gt;</span><span class="repo-folder">no local project</span>', '<span class="repo-circle active-circle">Remote<br>Repository<strong>project history</strong></span><span class="sync-arrow active-sync">-&gt;</span><span class="repo-folder git-folder">GitLearning/.git/</span>', 'git clone creates a new local copy connected to the remote.'),
        'command-11': inspection('Remote URLs', '<span class="repo-circle">origin<strong>fetch + push</strong></span>', ['origin name', 'Fetch URL', 'Push URL'], 'git remote -v displays connection details only.'),
        'command-12': inspection('Local branches', branch('main') + '<span class="branch-row">feature</span><span class="branch-row">ui</span>', ['Current branch', 'Other local branch', 'Branch names'], 'git branch lists local branch references.'),
        'command-13': action('HEAD switched', branch('main') + '<span class="branch-row">feature</span>', '<span class="branch-row">main</span>' + branch('feature'), 'git switch moves HEAD and updates the working tree.'),
        'command-14': action('Branch created and selected', branch('main'), branch('ui') + '<span class="branch-row">main</span>', 'git switch -c creates a branch, then moves HEAD to it.'),
        'command-15': action('Branch deleted', branch('main') + '<span class="branch-row">ui</span>', branch('main') + '<span class="branch-row muted-lane">ui removed</span>', 'git branch -d removes the finished local branch reference.'),
        'command-16': action('Branches merged', '<span class="branch-row">main o---o</span><span class="branch-row">feature &nbsp; \\---o</span>', '<span class="branch-row active-branch">main o---o---M</span><span class="branch-row">feature &nbsp; \\---o-/</span>', 'git merge combines another branch into the current branch.'),
        'command-17': inspection('Working-tree differences', lane('Working Directory', 'modified') + '<span class="flow-arrow">vs</span>' + lane('HEAD', 'last commit'), ['Unstaged file edits', 'Current working tree', 'Comparison base'], 'git diff shows unstaged changes.'),
        'command-18': inspection('Staged differences', lane('Staging Area', 'index.html', 'staged-lane') + '<span class="flow-arrow">vs</span>' + lane('HEAD', 'last commit'), ['Staged snapshot', 'What the next commit contains', 'HEAD comparison'], 'git diff --staged shows changes prepared for commit.'),
        'command-19': inspection('Total changes since HEAD', lane('Working + Staging', 'all changes', 'active-lane') + '<span class="flow-arrow">vs</span>' + lane('HEAD', 'last commit'), ['Staged changes', 'Unstaged changes', 'Last committed state'], 'git diff HEAD includes staged and unstaged differences.'),
        'command-20': action('Commits rebased', '<span class="branch-row">main o---o</span><span class="branch-row">feature &nbsp; \\--A--B</span>', '<span class="branch-row">main o---o</span><span class="branch-row active-branch">feature &nbsp; \\--A\'--B\'</span>', 'git rebase replays feature commits on a new base.'),
        'command-21': action('Rebase continued', '<span class="state-chip changed">rebase paused: conflict</span><span class="lane-box staged-lane">resolved file</span>', '<span class="state-chip clean">rebase complete</span><span class="commit-node active-node">B<strong>applied</strong></span>', 'git rebase --continue resumes after conflict resolution.'),
        'command-22': inspection('Fetched references', '<span class="repo-circle">Local<br>Repository<strong>main</strong></span><span class="sync-arrow">&lt;-</span><span class="repo-circle active-circle">origin/main<strong>new ref</strong></span>', ['Remote-tracking ref updated', 'Local files unchanged', 'No merge performed'], 'git fetch downloads references without changing the working tree.'),
        'command-23': action('Project published', '<span class="repo-folder">project/</span><span class="flow-arrow">-&gt;</span><span class="repo-circle muted-circle">Remote<br>empty</span>', '<span class="repo-folder git-folder">project + .git/</span><span class="flow-arrow active-sync">-&gt;</span><span class="repo-circle active-circle">Remote<br>main published</span>', 'The setup sequence initializes, saves, connects, and publishes a project.'),
        'command-24': inspection('Tracked branches', '<span class="branch-row active-branch">main [origin/main]</span><span class="branch-row">feature [origin/feature: ahead 1]</span>', ['Local branch', 'Upstream branch', 'Ahead/behind count'], 'git branch -vv shows upstream tracking metadata.'),
        'command-25': inspection('Branch comparison', '<span class="branch-row active-branch">ui o---o</span><span class="branch-row">origin/ui o---o---R</span>', ['Local ui tip', 'Remote-tracking tip', 'Commits that differ'], 'git diff ui origin/ui compares two references.'),
        'command-26': action('Pulled updates', '<span class="repo-circle">origin/main<strong>new commit</strong></span><span class="sync-arrow">-&gt;</span><span class="branch-row">HEAD -&gt; main (old)</span>', '<span class="repo-circle active-circle">origin/main<strong>received</strong></span><span class="sync-arrow active-sync">-&gt;</span><span class="branch-row active-branch">HEAD -&gt; main (updated)</span>', 'git pull fetches and integrates upstream work.'),
        'command-27': inspection('Recent graph', '<span class="branch-row active-branch">* 8a12c4d main</span><span class="branch-row">| * 7c31ab2 feature</span><span class="branch-row">|/</span>', ['Latest commit', 'Feature branch commit', 'Merge/divergence path'], 'The limited graph shows the last five reachable commits.'),
        'command-28': action('Commit cherry-picked', '<span class="branch-row active-branch">main o---o</span><span class="commit-node">8a12c4d<strong>fix to copy</strong></span>', '<span class="branch-row active-branch">main o---o---C\'</span><span class="commit-node active-node">C\'<strong>new commit on main</strong></span>', 'git cherry-pick applies one existing commit as a new commit.'),
        'command-29': action('Cherry-pick continued', '<span class="state-chip changed">cherry-pick paused</span><span class="lane-box staged-lane">resolved file</span>', '<span class="state-chip clean">cherry-pick complete</span><span class="commit-node active-node">C\'<strong>applied</strong></span>', 'git cherry-pick --continue finishes a resolved operation.'),
        'command-30': action('Cherry-pick aborted', '<span class="state-chip changed">cherry-pick paused</span><span class="lane-box">conflict edits</span>', '<span class="state-chip clean">operation cancelled</span><span class="branch-row active-branch">main restored</span>', 'git cherry-pick --abort restores the pre-operation state.'),
        'command-31': inspection('All branches', branch('main') + '<span class="branch-row">feature</span><span class="branch-row">remotes/origin/main</span>', ['Current local branch', 'Other local branch', 'Remote-tracking branch'], 'git branch -a lists local and remote-tracking refs.'),
        'command-32': inspection('Remote configuration', '<span class="repo-circle active-circle">origin<strong>github.com/team/project</strong></span>', ['Remote name', 'Fetch endpoint', 'Push endpoint'], 'git remote -v inspects URLs without changing repository state.'),
        'command-33': inspection('Short status', '<span class="branch-row active-branch">## main...origin/main</span><span class="state-chip changed">M index.html</span>', ['Branch tracking header', 'Modified file marker', 'Compact status symbols'], 'git status -sb gives a compact read-only summary.'),
        'command-34': inspection('Remote branches', '<span class="branch-row">origin/HEAD -&gt; origin/main</span><span class="branch-row active-branch">origin/main</span>', ['Remote HEAD pointer', 'Remote-tracking branch'], 'git branch -r lists only remote-tracking branches.'),
        'command-35': action('Branch published and tracked', '<span class="branch-row active-branch">branchName (local)</span><span class="repo-circle muted-circle">origin (no branch)</span>', '<span class="branch-row active-branch">branchName -&gt; origin/branchName</span><span class="repo-circle active-circle">upstream set</span>', 'git push -u publishes a branch and records its upstream.'),
        'command-36': inspection('Remote summary', '<span class="repo-circle active-circle">origin<strong>HEAD branch: main</strong></span>', ['Remote identity', 'Default branch', 'Tracked branches'], 'git remote show origin summarizes remote relationships.'),
        'command-37': action('Release tag attached', '<span class="commit-node">a4f3c1<strong>release commit</strong></span>', '<span class="commit-node active-node"><b>v1.0.0</b><strong>a4f3c1 release commit</strong></span>', 'git tag attaches a release name to one exact commit.'),
        'command-38': action('Tag deleted', '<span class="commit-node active-node"><b>tagName</b><strong>a4f3c1</strong></span>', '<span class="commit-node"><b>tagName removed</b><strong>a4f3c1 remains</strong></span>', 'git tag -d removes the local tag name, not the commit.'),
        'command-39': action('Tag moved', '<span class="commit-node"><b>tagName</b><strong>a4f3c1</strong></span>', '<span class="commit-node active-node"><b>tagName</b><strong>b91d20 new target</strong></span>', 'git tag -f moves a tag reference to another commit.'),
        'command-40': inspection('Tagged ancestry', '<span class="commit-node active-node"><b>tagName</b><strong>merge commit</strong></span><span class="history-line"></span><span class="commit-node">a4f3c1<strong>first parent</strong></span>', ['Tag starting point', 'First-parent path', 'Reachable commits'], 'git rev-list -m 1 reads ancestry; it does not attach or move a tag.'),
        'command-41': inspection('Git object details', '<span class="commit-node active-node">HEAD<strong>type: commit</strong></span>', ['Object reference', 'Object type', 'Stored Git data'], 'git cat-file inspects the object database.'),
        'command-42': inspection('HEAD movement log', '<span class="history-node active-node">HEAD@{0}<strong>commit</strong></span><span class="history-line"></span><span class="history-node">HEAD@{1}<strong>checkout</strong></span>', ['Current HEAD position', 'Previous HEAD position', 'Local-only record'], 'git reflog reads local reference movements.'),
        'command-43': inspection('Previous HEAD state', '<span class="history-node active-node">HEAD@{1}<strong>4b91f20</strong></span>', ['Selected reflog entry', 'Commit contents', 'Recovery target'], 'git show HEAD@{1} inspects a previous HEAD position.'),
        'command-44': inspection('Recent reflog entries', '<span class="history-node active-node">HEAD@{0}<strong>commit</strong></span><span class="history-node">HEAD@{1}<strong>switch</strong></span><span class="history-node">HEAD@{2}<strong>reset</strong></span>', ['Entry 0: newest', 'Entry 1: prior move', 'Entry 2: earlier move'], 'git reflog -n 5 limits the displayed local history.'),
        'command-45': inspection('Branch reflog', '<span class="history-node active-node">branchName@{0}<strong>commit</strong></span><span class="history-line"></span><span class="history-node">branchName@{1}<strong>switch</strong></span>', ['Named branch ref', 'Recent branch action', 'Local recovery trail'], 'git reflog branchName reads one branch reference history.')
    };

    commandCards.forEach((card) => {
        card.dataset.scenario = card.id;
    });

    commandOrder.forEach((commandId, position) => {
        const card = document.querySelector(`#command-${String(commandId).padStart(2, '0')}`);
        if (!card) return;
        document.querySelector('.command-group')?.append(card);
        const number = card.querySelector('.command-number');
        if (number) number.textContent = `${String(position + 1).padStart(2, '0')} / ${commandOrder.length}`;
    });

    const reviewedKey = 'git-learning-reviewed-commands';
    const reviewed = new Set(JSON.parse(localStorage.getItem(reviewedKey) || '[]'));
    const progressLabel = document.querySelector('.learning-progress-label');
    const progressFill = document.querySelector('.learning-progress-fill');
    const updateProgress = () => {
        const count = reviewed.size;
        if (progressLabel) progressLabel.textContent = `${count} / ${commandOrder.length} commands reviewed`;
        if (progressFill) progressFill.style.width = `${(count / commandOrder.length) * 100}%`;
    };
    commandCards.forEach((card) => {
        const checkboxId = `${card.id}-reviewed`;
        const control = document.createElement('label');
        control.className = 'understood-toggle';
        control.htmlFor = checkboxId;
        control.innerHTML = `<input id="${checkboxId}" type="checkbox" ${reviewed.has(card.id) ? 'checked' : ''}><span>Understood</span>`;
        control.querySelector('input').addEventListener('change', (event) => {
            event.target.checked ? reviewed.add(card.id) : reviewed.delete(card.id);
            localStorage.setItem(reviewedKey, JSON.stringify([...reviewed]));
            updateProgress();
        });
        card.querySelector('.command-meta')?.append(control);
        const relationship = relationships[card.id];
        if (relationship) {
            const footer = document.createElement('footer');
            footer.className = 'command-relationships';
            footer.textContent = [relationship.predecessor && `Comes after: ${relationship.predecessor}`, relationship.successor && `Comes before: ${relationship.successor}`].filter(Boolean).join(' · ');
            card.append(footer);
        }
        if (dangerLevels[card.id]) {
            const badge = document.createElement('span');
            badge.className = 'danger-badge';
            badge.title = dangerLevels[card.id];
            badge.setAttribute('aria-label', dangerLevels[card.id]);
            badge.innerHTML = '<span aria-hidden="true"></span> Use with care';
            card.querySelector('.command-meta')?.append(badge);
        }
    });
    updateProgress();

    const addQuiz = (title, questions) => {
        const quiz = document.createElement('section');
        quiz.className = 'section-quiz';
        quiz.setAttribute('aria-label', `${title} recall quiz`);
        quiz.innerHTML = `<p class="quiz-kicker">Quick recall</p><h3>${title} quiz</h3><p>Choose an answer to check your understanding.</p>`;
        questions.forEach(([question, answer, options], index) => {
            const fieldset = document.createElement('fieldset');
            fieldset.innerHTML = `<legend>${index + 1}. ${question}</legend>${options.map((option) => `<button type="button" data-answer="${option === answer}">${option}</button>`).join('')}<span class="quiz-feedback" aria-live="polite"></span>`;
            fieldset.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
                const correct = button.dataset.answer === 'true';
                fieldset.querySelectorAll('button').forEach((choice) => choice.classList.remove('is-correct', 'is-wrong'));
                button.classList.add(correct ? 'is-correct' : 'is-wrong');
                fieldset.querySelector('.quiz-feedback').textContent = correct ? 'Correct — nice recall.' : `Not quite. The answer is ${answer}.`;
            }));
            quiz.append(fieldset);
        });
        return quiz;
    };
    Object.entries(quizData).forEach(([title, questions]) => {
        const ids = commandOrder.filter((id) => categoryByCommandId[id] === title);
        document.querySelector(`#command-${String(ids.at(-1)).padStart(2, '0')}`)?.after(addQuiz(title, questions));
    });

    const comparisons = [
        ['command-21', 'Merge vs rebase', 'git merge', 'Combines histories with a merge commit.', 'Prefer for shared branches and preserved history.', 'git rebase', 'Replays your commits on a new base.', 'Prefer for cleaning up your own local branch.'],
        ['command-26', 'Fetch vs pull', 'git fetch', 'Downloads remote updates without changing files.', 'Prefer when you want to inspect first.', 'git pull', 'Fetches, then integrates into your branch.', 'Prefer when you are ready to update locally.'],
        ['command-30', 'Cherry-pick vs merge', 'git cherry-pick', 'Copies one selected commit onto this branch.', 'Prefer for a targeted fix.', 'git merge', 'Brings in a branch’s shared history.', 'Prefer for the complete branch of work.']
    ];
    comparisons.forEach(([afterId, title, leftName, leftDoes, leftPrefer, rightName, rightDoes, rightPrefer]) => {
        const comparison = document.createElement('section');
        comparison.className = 'command-comparison';
        comparison.innerHTML = `<p class="quiz-kicker">Commonly confused</p><h3>${title}</h3><div><article><h4>${leftName}</h4><p>${leftDoes}</p><strong>Prefer it:</strong><p>${leftPrefer}</p></article><article><h4>${rightName}</h4><p>${rightDoes}</p><strong>Prefer it:</strong><p>${rightPrefer}</p></article></div>`;
        document.getElementById(afterId)?.after(comparison);
    });

    commandCards.forEach((card) => {
        const scenario = visualScenarios[card.dataset.scenario];
        if (!scenario) return;
        const visualizer = document.createElement('div');
        visualizer.className = `git-visualizer ${scenario.type}-visualizer`;
        const controls = scenario.type === 'action'
            ? '<button class="visualizer-run" type="button">Run operation</button>'
            : '<button class="visualizer-run" type="button">Highlight details</button>';
        const content = scenario.type === 'action'
            ? `<div class="visualizer-stage"><div class="visual-state before-state">${scenario.before}</div><span class="visualizer-status">Before</span></div>`
            : `<div class="visualizer-stage"><div class="visual-state">${scenario.diagram}</div><span class="visualizer-status">Read-only</span></div><div class="visual-callouts"><div class="visual-callouts-inner">${scenario.callouts.map((callout) => `<span class="visual-callout">${callout}</span>`).join('')}</div></div>`;
        visualizer.innerHTML = `<div class="visualizer-header"><div><span class="visualizer-kicker">${scenario.type === 'action' ? 'Repository operation' : 'Repository inspection'}</span><strong>${scenario.label}</strong></div>${controls}</div>${content}<p class="visualizer-caption">${scenario.caption}</p>`;
        const runButton = visualizer.querySelector('.visualizer-run');
        if (scenario.type === 'action') {
            const stage = visualizer.querySelector('.visualizer-stage');
            const status = visualizer.querySelector('.visualizer-status');
            runButton.addEventListener('click', () => {
                const isAfter = visualizer.classList.toggle('is-after');
                stage.querySelector('.visual-state').innerHTML = isAfter ? scenario.after : scenario.before;
                status.textContent = isAfter ? 'After' : 'Before';
                runButton.textContent = isAfter ? 'Reset view' : 'Run operation';
            });
        } else {
            runButton.addEventListener('click', () => {
                const highlighted = visualizer.classList.toggle('show-callouts');
                runButton.textContent = highlighted ? 'Hide details' : 'Highlight details';
            });
        }
        card.append(visualizer);
        // Keep the learning relationship as the card's final, scan-friendly footer.
        const relationshipFooter = card.querySelector('.command-relationships');
        if (relationshipFooter) card.append(relationshipFooter);
    });

    commandCards.forEach((card) => {
        const terminal = card.querySelector('.terminal-window');
        const pre = terminal?.querySelector('pre');
        const header = terminal?.querySelector('.terminal-header');
        if (!pre || !header) return;
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.type = 'button';
        copyButton.textContent = 'Copy';
        copyButton.setAttribute('aria-label', `Copy the ${card.querySelector('h3')?.textContent || 'Git'} example`);
        let resetTimer;
        copyButton.addEventListener('click', async () => {
            const text = (pre.dataset.terminalText || pre.textContent).trim();
            let copied = false;
            try {
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(text);
                    copied = true;
                }
            } catch {
                copied = false;
            }
            if (!copied) {
                const fallback = document.createElement('textarea');
                fallback.value = text;
                try {
                    document.body.append(fallback);
                    fallback.select();
                    copied = document.execCommand('copy');
                } catch {
                    copied = false;
                } finally {
                    fallback.remove();
                }
            }
            copyButton.textContent = copied ? 'Copied' : 'Copy failed';
            window.clearTimeout(resetTimer);
            resetTimer = window.setTimeout(() => { copyButton.textContent = 'Copy'; }, 1400);
        });
        header.append(copyButton);
    });

    if (navigation) {
        const links = [...navigation.querySelectorAll('a')];
        const navigationTools = navigation.querySelector('.journey-nav-tools');
        const linksByCommandId = new Map(links.map((link) => [link.getAttribute('href'), link]));
        const groupTitles = ['Start here', 'Branches', 'Remote work', 'Recovery and releases'];
        const groups = groupTitles.map((title) => ({
            title,
            commandIds: commandOrder.filter((commandId) => categoryByCommandId[commandId] === title)
        }));
        navigation.replaceChildren();
        if (navigationTools) navigation.append(navigationTools);
        const groupedLinks = new Set();
        groups.forEach((group, groupIndex) => {
            const details = document.createElement('details');
            details.open = groupIndex === 0;
            const summary = document.createElement('summary');
            summary.textContent = group.title;
            details.append(summary);
            group.commandIds.forEach((commandId) => {
                const link = linksByCommandId.get(`#command-${String(commandId).padStart(2, '0')}`);
                if (!link) return;
                groupedLinks.add(link);
                details.append(link);
            });
            navigation.append(details);
        });
        links.filter((link) => !groupedLinks.has(link)).forEach((link) => navigation.querySelector('details:last-child')?.append(link));
        navigation.querySelectorAll('details').forEach((details) => {
            details.addEventListener('toggle', () => {
                if (navigation.classList.contains('is-filtering')) return;
                if (!details.open) return;
                navigation.querySelectorAll('details').forEach((other) => {
                    if (other !== details) other.open = false;
                });
            });
        });
        const searchInput = navigation.querySelector('.command-search');
        searchInput?.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            navigation.classList.toggle('is-filtering', Boolean(query));
            navigation.querySelectorAll('details').forEach((details) => {
                let hasMatch = false;
                details.querySelectorAll('a').forEach((link) => {
                    const matches = !query || link.textContent.toLowerCase().includes(query);
                    link.hidden = !matches;
                    hasMatch ||= matches;
                    document.querySelector(link.getAttribute('href'))?.classList.toggle('search-match', Boolean(query) && matches);
                });
                details.hidden = Boolean(query) && !hasMatch;
                details.open = query ? hasMatch : details.querySelector('summary')?.textContent === 'Start here';
            });
        });
        const referenceGroup = navigation.querySelector('details:last-child');
        ['tags', 'reflog'].forEach((sectionId) => {
            const link = document.createElement('a');
            link.href = `#${sectionId}`;
            link.textContent = sectionId;
            referenceGroup.append(link);
        });
    }

    const observedSections = [...document.querySelectorAll('.command-card, .reference-section')];
    const navLinks = [...document.querySelectorAll('a[href^="#"]')];
    const linkById = new Map(navLinks.map((link) => [link.getAttribute('href'), link]));
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinks.forEach((link) => link.classList.remove('is-current'));
            linkById.get(`#${entry.target.id}`)?.classList.add('is-current');
        });
    }, { rootMargin: '-20% 0px -70% 0px' });
    observedSections.forEach((section) => observer.observe(section));

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const terminalObserver = new IntersectionObserver((entries, currentObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const pre = entry.target;
                const lines = (pre.dataset.terminalText || pre.textContent).replace(/\r/g, '').split('\n');
                pre.textContent = '';
                let lineIndex = 0;
                const revealLine = () => {
                    if (lineIndex >= lines.length) return;
                    const line = lines[lineIndex++];
                    if (!line.trimStart().startsWith('$')) {
                        pre.textContent += `${line}${lineIndex < lines.length ? '\n' : ''}`;
                        window.setTimeout(revealLine, 110);
                        return;
                    }
                    let characterIndex = 0;
                    const typeCharacter = () => {
                        pre.textContent += line[characterIndex++] || '';
                        if (characterIndex < line.length) window.setTimeout(typeCharacter, 18);
                        else { if (lineIndex < lines.length) pre.textContent += '\n'; window.setTimeout(revealLine, 130); }
                    };
                    typeCharacter();
                };
                revealLine();
                currentObserver.unobserve(pre);
            });
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0.2 });
        document.querySelectorAll('.terminal-window pre').forEach((pre) => {
            pre.dataset.terminalText = pre.textContent;
            terminalObserver.observe(pre);
        });
    }
});
