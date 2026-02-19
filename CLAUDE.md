# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Docker image setup for running the Claude Code CLI tool in a containerized environment.

## Build and Run Commands

Build the Docker image:
```bash
docker build -t claude-code .
```

Run the container:
```bash
docker run -it claude-code
```

## Structure

- `Dockerfile` - Container definition based on node:20-bullseye with git, ripgrep, and @anthropic-ai/claude-code installed
- `.claude.json` - Claude Code configuration and feature flags
