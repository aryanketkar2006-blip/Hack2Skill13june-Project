export async function fetchRepoInfo(repoPath) {
  // repoPath like "google/gemini"
  const [owner, repo] = repoPath.split('/');
  if (!owner || !repo) {
    throw new Error('Invalid repository path. Use format: owner/repo');
  }

  try {
    // Fetch repo metadata
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { 'User-Agent': 'InsightAI/1.0' }
    });
    
    if (!repoRes.ok) {
      throw new Error(`Repository not found: ${repoRes.status}`);
    }
    
    const repoData = await repoRes.json();

    // Fetch file tree (default branch)
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`,
      { headers: { 'User-Agent': 'InsightAI/1.0' } }
    );
    
    const treeData = await treeRes.json();
    const files = (treeData.tree || [])
      .filter(f => f.type === 'blob')
      .map(f => f.path);

    // Fetch key files
    const keyFiles = ['README.md', 'readme.md', 'README.rst', 'package.json', 'setup.py', 'Cargo.toml', 'go.mod', 'pom.xml', 'requirements.txt'];
    const keyFileContents = {};
    
    for (const keyFile of keyFiles) {
      const match = files.find(f => f.toLowerCase() === keyFile.toLowerCase());
      if (match) {
        try {
          const contentRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${match}`,
            { headers: { 'User-Agent': 'InsightAI/1.0', 'Accept': 'application/vnd.github.raw' } }
          );
          if (contentRes.ok) {
            const content = await contentRes.text();
            keyFileContents[match] = content.substring(0, 5000);
          }
        } catch { /* skip */ }
      }
    }

    // Build a structured text summary
    const fileTree = files.slice(0, 100).join('\n');
    const text = `
# Repository: ${repoData.full_name}

**Description:** ${repoData.description || 'No description'}
**Language:** ${repoData.language || 'Unknown'}
**Stars:** ${repoData.stargazers_count}
**Forks:** ${repoData.forks_count}
**License:** ${repoData.license?.name || 'None'}
**Last Updated:** ${repoData.updated_at}

## File Structure (${files.length} files)
\`\`\`
${fileTree}
\`\`\`

## Key Files
${Object.entries(keyFileContents).map(([name, content]) => `### ${name}\n\`\`\`\n${content}\n\`\`\``).join('\n\n')}
`.trim();

    return {
      text,
      title: repoData.full_name,
      metadata: {
        name: repoData.full_name,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        visibility: repoData.private ? 'Private' : 'Public'
      }
    };
  } catch (error) {
    throw new Error(`GitHub fetch failed: ${error.message}`);
  }
}
