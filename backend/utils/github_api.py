"""
GitHub API Helper Functions
Fetches user profile, repository stats, and README content
"""
import os
import re
from typing import Optional, Dict, List
import requests
from datetime import datetime


class GitHubAPI:
    def __init__(self, token: Optional[str] = None):
        """Initialize GitHub API client"""
        self.token = token or os.getenv("GITHUB_TOKEN")
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json"
        }
        if self.token:
            self.headers["Authorization"] = f"token {self.token}"
    
    def extract_username_from_url(self, url: str) -> Optional[str]:
        """
        Extract GitHub username from various URL formats:
        - github.com/username
        - github.com/username/repo
        """
        patterns = [
            r'github\.com/([a-zA-Z0-9_-]+)',
            r'github\.com/([a-zA-Z0-9_-]+)/.*'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                username = match.group(1)
                # Exclude common non-user paths
                if username not in ['features', 'pricing', 'explore', 'topics', 'collections']:
                    return username
        
        return None
    
    def get_user_profile(self, username: str) -> Optional[Dict]:
        """
        Fetch user profile information
        Returns: {
            "username": str,
            "name": str,
            "bio": str,
            "followers": int,
            "following": int,
            "public_repos": int,
            "avatar_url": str,
            "blog": str,
            "location": str,
            "company": str
        }
        """
        try:
            response = requests.get(
                f"{self.base_url}/users/{username}",
                headers=self.headers
            )
            response.raise_for_status()
            
            data = response.json()
            
            return {
                "username": data['login'],
                "name": data.get('name', ''),
                "bio": data.get('bio', ''),
                "followers": data['followers'],
                "following": data['following'],
                "public_repos": data['public_repos'],
                "avatar_url": data['avatar_url'],
                "blog": data.get('blog', ''),
                "location": data.get('location', ''),
                "company": data.get('company', ''),
                "twitter_username": data.get('twitter_username', ''),
                "created_at": data['created_at'],
                "profile_url": data['html_url']
            }
        except Exception as e:
            print(f"Error fetching user profile: {e}")
            return None
    
    def get_user_repos(self, username: str, sort: str = "updated", max_results: int = 10) -> List[Dict]:
        """
        Fetch user's repositories
        sort options: "created", "updated", "pushed", "full_name"
        """
        try:
            response = requests.get(
                f"{self.base_url}/users/{username}/repos",
                headers=self.headers,
                params={
                    "sort": sort,
                    "per_page": max_results,
                    "type": "owner"  # Only repos owned by user, not forks
                }
            )
            response.raise_for_status()
            
            repos = []
            for repo in response.json():
                repos.append({
                    "name": repo['name'],
                    "full_name": repo['full_name'],
                    "description": repo.get('description', ''),
                    "url": repo['html_url'],
                    "stars": repo['stargazers_count'],
                    "forks": repo['forks_count'],
                    "watchers": repo['watchers_count'],
                    "language": repo.get('language', ''),
                    "created_at": repo['created_at'],
                    "updated_at": repo['updated_at'],
                    "topics": repo.get('topics', []),
                    "is_fork": repo['fork'],
                    "size": repo['size']
                })
            
            return repos
        except Exception as e:
            print(f"Error fetching repositories: {e}")
            return []
    
    def get_top_repos_by_stars(self, username: str, max_results: int = 5) -> List[Dict]:
        """Get user's most starred repositories"""
        repos = self.get_user_repos(username, sort="updated", max_results=30)
        
        # Filter out forks and sort by stars
        original_repos = [r for r in repos if not r['is_fork']]
        sorted_repos = sorted(original_repos, key=lambda x: x['stars'], reverse=True)
        
        return sorted_repos[:max_results]
    
    def get_repo_readme(self, username: str, repo_name: str) -> Optional[str]:
        """
        Fetch README content from a repository
        Returns README in markdown format
        """
        try:
            response = requests.get(
                f"{self.base_url}/repos/{username}/{repo_name}/readme",
                headers=self.headers
            )
            response.raise_for_status()
            
            readme_data = response.json()
            
            # Get the raw content
            raw_response = requests.get(readme_data['download_url'])
            raw_response.raise_for_status()
            
            return raw_response.text
        except Exception as e:
            print(f"Error fetching README for {repo_name}: {e}")
            return None
    
    def get_user_languages(self, username: str) -> Dict[str, int]:
        """
        Analyze primary languages across all repos
        Returns dict of language: byte count
        """
        repos = self.get_user_repos(username, max_results=30)
        language_stats = {}
        
        for repo in repos:
            if repo['is_fork']:
                continue
            
            try:
                response = requests.get(
                    f"{self.base_url}/repos/{repo['full_name']}/languages",
                    headers=self.headers
                )
                response.raise_for_status()
                
                langs = response.json()
                for lang, bytes_count in langs.items():
                    language_stats[lang] = language_stats.get(lang, 0) + bytes_count
            except Exception as e:
                print(f"Error fetching languages for {repo['name']}: {e}")
        
        return language_stats
    
    def get_user_activity_summary(self, username: str) -> Dict:
        """
        Get user's recent activity summary
        Fetches recent events (commits, PRs, issues)
        """
        try:
            response = requests.get(
                f"{self.base_url}/users/{username}/events/public",
                headers=self.headers,
                params={"per_page": 100}
            )
            response.raise_for_status()
            
            events = response.json()
            
            # Count event types
            event_counts = {}
            recent_repos = set()
            
            for event in events:
                event_type = event['type']
                event_counts[event_type] = event_counts.get(event_type, 0) + 1
                
                if 'repo' in event:
                    recent_repos.add(event['repo']['name'])
            
            return {
                "total_events": len(events),
                "event_types": event_counts,
                "active_repos_count": len(recent_repos),
                "recent_repos": list(recent_repos)[:10]
            }
        except Exception as e:
            print(f"Error fetching activity: {e}")
            return {}
    
    def get_repo_topics_for_analysis(self, username: str, max_repos: int = 10) -> List[str]:
        """
        Get repository descriptions and topics for AI analysis
        Returns combined list of topics and descriptions
        """
        repos = self.get_top_repos_by_stars(username, max_results=max_repos)
        
        topics = []
        for repo in repos:
            topics.extend(repo['topics'])
            if repo['description']:
                topics.append(repo['description'])
        
        return topics
    
    def analyze_url(self, url: str) -> Optional[Dict]:
        """
        Main method: Analyze any GitHub URL
        Returns comprehensive user data with top repos
        """
        username = self.extract_username_from_url(url)
        if not username:
            return None
        
        # Fetch user profile
        profile = self.get_user_profile(username)
        if not profile:
            return None
        
        # Fetch top repositories
        top_repos = self.get_top_repos_by_stars(username, max_results=5)
        
        # Get README from top repo if available
        if top_repos:
            top_repo_name = top_repos[0]['name']
            readme = self.get_repo_readme(username, top_repo_name)
            profile['top_repo_readme'] = readme
            profile['top_repo'] = top_repos[0]
        
        # Get language statistics
        languages = self.get_user_languages(username)
        top_languages = sorted(languages.items(), key=lambda x: x[1], reverse=True)[:5]
        profile['top_languages'] = [lang for lang, _ in top_languages]
        
        # Get activity summary
        activity = self.get_user_activity_summary(username)
        profile['activity'] = activity
        
        profile['top_repos'] = top_repos
        profile['repo_descriptions'] = [r['description'] for r in top_repos if r['description']]
        
        return profile
    
    @staticmethod
    def format_follower_count(count: int) -> str:
        """Format follower count (e.g., 1500 -> '1.5K')"""
        if count >= 1_000_000:
            return f"{count / 1_000_000:.1f}M"
        elif count >= 1_000:
            return f"{count / 1_000:.1f}K"
        return str(count)
