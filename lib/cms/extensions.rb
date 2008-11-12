module Cms
  class << self
    __root__ = File.expand_path(File.join(File.dirname(__FILE__), "..", ".."))
    define_method(:root) { __root__ }
    def load_rake_tasks
      load "#{Cms.root}/lib/tasks/cms.rake"
    end
    #This is called after the environment is ready
    def init
      #Write out the page templates to the file system
      if ActiveRecord::Base.connection.tables.include?("page_templates")
        tmp_view_path = "#{Rails.root}/tmp/views"
        Rails.logger.info("~~ Writing page templates to #{tmp_view_path}")
        ActionController::Base.append_view_path tmp_view_path
        PageTemplate.all.each{|pt| pt.create_layout_file }
      end      
      ActionView::Base.default_form_builder = Cms::FormBuilder
    end    
  end
  module Errors
    class AccessDenied < StandardError
      def initialize
        super("Access Denied")
      end
    end
  end
end

Dir["#{File.join(File.dirname(__FILE__), "extensions")}/**/*.rb"].each do |f| 
  Rails.logger.info "~~ Loading extensions from #{f}"
  require f
end

ActiveSupport::CoreExtensions::Time::Conversions::DATE_FORMATS.merge!(
	:year_month_day => '%Y/%m/%d',
	:date => '%m/%d/%Y'	
)