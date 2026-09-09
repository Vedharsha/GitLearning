document.addEventListener('DOMContentLoaded', () => {
    const commandCards = [...document.querySelectorAll('.command-card')];
    const navigation = document.querySelector('.journey-nav');
    const commandOrder = [
        1, 2, 3, 4, 5, 6, 7, 17, 18, 19,
        12, 13, 14, 15, 16, 20, 21, 24, 27,
        8, 9, 10, 11, 22, 23, 25, 26, 32, 33, 34, 35, 36,
        28, 29, 30, 31, 37, 38, 39, 40, 41, 42, 43, 44, 45
    ];

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
            : `<div class="visualizer-stage"><div class="visual-state">${scenario.diagram}</div><span class="visualizer-status">Read-only</span></div><div class="visual-callouts">${scenario.callouts.map((callout) => `<span class="visual-callout">${callout}</span>`).join('')}</div>`;
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
            const text = pre.textContent.trim();
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
        const linksByCommandId = new Map(links.map((link) => [link.getAttribute('href'), link]));
        const groups = [
            { title: 'Start here', commandIds: [1, 2, 3, 4, 5, 6, 7, 17, 18, 19] },
            { title: 'Branches', commandIds: [12, 13, 14, 15, 16, 20, 21, 24, 27] },
            { title: 'Remote work', commandIds: [8, 9, 10, 11, 22, 23, 25, 26, 32, 33, 34, 35, 36] },
            { title: 'Recovery and releases', commandIds: [28, 29, 30, 31, 37, 38, 39, 40, 41, 42, 43, 44, 45] }
        ];
        navigation.replaceChildren();
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
                if (!details.open) return;
                navigation.querySelectorAll('details').forEach((other) => {
                    if (other !== details) other.open = false;
                });
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
});
