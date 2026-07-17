#!/usr/bin/env ruby
# frozen_string_literal: true

require "yaml"
require "date"

ROOT = File.expand_path("..", __dir__)
POSTS = Dir.glob(File.join(ROOT, "_posts", "*.{md,markdown}"))

def front_matter(path)
  source = File.read(path, encoding: "UTF-8")
  match = source.match(/\A---\s*\n(.*?)\n---\s*\n/m)
  return [{}, source] unless match

  [YAML.safe_load(match[1], permitted_classes: [Date, Time], aliases: true) || {}, source]
end

def discovery_log?(data)
  tags = Array(data["tags"]).map(&:to_s)
  tags.include?("Discovery Log") || data["layout"] == "discovery-log"
end

warnings = []

POSTS.each do |path|
  data, source = front_matter(path)
  next unless discovery_log?(data)

  relative = path.delete_prefix("#{ROOT}/")
  layout = data["layout"]
  warnings << "#{relative}: Discovery Log에는 layout: discovery-log가 필요합니다 (현재: #{layout || '없음'})." unless layout == "discovery-log"

  markdown_images = source.scan(/!\[[^\]]*\]\([^\)]*\)/)
  wide_images = source.scan(/<figure\s+class=[\"'][^\"']*discovery-log__wide-image[^\"']*[\"']/)
  if markdown_images.any? && wide_images.empty?
    warnings << "#{relative}: 대표 장면 이미지는 Markdown 이미지 대신 discovery-log__wide-image figure 구조를 사용하세요."
  end

  permalink = data["permalink"]
  if permalink.nil? || permalink.empty?
    category = Array(data["categories"]).first.to_s
    filename_slug = File.basename(path, File.extname(path)).sub(/^\d{4}-\d{2}-\d{2}-/, "")
    permalink = "/#{category}/#{filename_slug}/"
  end

  output = File.join(ROOT, "_site", permalink.sub(%r{\A/}, ""), "index.html")
  if File.exist?(output)
    html = File.read(output, encoding: "UTF-8")
    unless html.include?("layout--discovery-log")
      warnings << "#{relative}: 생성 HTML에 layout--discovery-log가 없습니다. Jekyll 빌드와 레이아웃을 확인하세요."
    end
  else
    warnings << "#{relative}: 생성 HTML이 없습니다. bundle exec jekyll build 후 다시 확인하세요."
  end
end

if warnings.empty?
  puts "Discovery Log validation passed."
else
  warnings.each { |warning| warn "WARNING: #{warning}" }
  warn "Discovery Log validation completed with #{warnings.length} warning(s)."
end

exit 0
