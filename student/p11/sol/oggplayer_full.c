#include <gst/gst.h>
#include <glib.h>
#include <string.h>

static gboolean
bus_call (GstBus     *bus,
          GstMessage *msg,
          gpointer    data)
{
  GMainLoop *loop = (GMainLoop *) data;
  char *src = GST_MESSAGE_SRC_NAME(msg);
  
  switch (GST_MESSAGE_TYPE (msg)) {

  case GST_MESSAGE_EOS:
    g_print ("..[bus].. (%s) :: End of stream\n", src);
    g_main_loop_quit (loop);
    break;

  case GST_MESSAGE_ERROR: {
    gchar  *debug;
    GError *error;
    
    gst_message_parse_error (msg, &error, &debug);
    g_free (debug);
    
    g_printerr ("..[bus].. (%s) :: Error: %s\n", src, error->message);
    g_error_free (error);

    g_main_loop_quit (loop);
    break;
  }
  default: {
    g_print ("..[bus].. %15s :: %-15s\n", src, GST_MESSAGE_TYPE_NAME(msg));
    break;
  }
  }

  return TRUE;
}


static void
on_pad_added (GstElement *element,
              GstPad     *pad,
              gpointer    data)
{
  GstPad *sinkpad;

  gchar *name = gst_pad_get_name(pad);
  char *caps = gst_caps_to_string(gst_pad_get_caps(pad));

  g_print ("...Dynamic pad created: %s, capabilities: %s\n", name, caps);

  /* We can now link this pad with the appropriate decoder sink pad */

  GstBin *bin = (GstBin *)data;
  GstElement *queue_aud = gst_bin_get_by_name(bin, "queue1");
  GstElement *queue_img = gst_bin_get_by_name(bin, "queue2");

  if (g_str_has_prefix(caps, "audio")) {
    /* Audio dynamic pad: conect audio pipeline */
    sinkpad = gst_element_get_static_pad (queue_aud, "sink");
    gst_pad_link (pad, sinkpad);
    gst_object_unref (sinkpad);
    
  } else if  (g_str_has_prefix(caps, "video")) {
    /* Audio dynamic pad: conect audio pipeline */
    sinkpad = gst_element_get_static_pad (queue_img, "sink");
    gst_pad_link (pad, sinkpad);
    gst_object_unref (sinkpad);
  }

}



int
main (int   argc,
      char *argv[])
{
  GMainLoop *loop;

  GstElement *pipeline, *source, *demuxer, *decoder, *conv, *sink;
  GstElement *vdecoder, *vconv, *vsink;
  GstElement *queue1, *queue2;
  GstBus *bus;

  /* Initialisation */
  gst_init (&argc, &argv);

  loop = g_main_loop_new (NULL, FALSE);


  /* Check input arguments */
  if (argc != 2) {
    g_printerr ("Usage: %s <Ogg/Vorbis filename>\n", argv[0]);
    return -1;
  }


  /* Create gstreamer elements */
  pipeline = gst_pipeline_new ("audio-player");
  source   = gst_element_factory_make ("filesrc",       "file-source");
  demuxer  = gst_element_factory_make ("oggdemux",      "ogg-demuxer");
  decoder  = gst_element_factory_make ("vorbisdec",     "vorbis-decoder");
  conv     = gst_element_factory_make ("audioconvert",  "converter");
  sink     = gst_element_factory_make ("autoaudiosink", "audio-output");

  vdecoder  = gst_element_factory_make ("theoradec",     "theora-decoder");
  vconv     = gst_element_factory_make ("ffmpegcolorspace",  "vconverter");
  vsink     = gst_element_factory_make ("cacasink", "video-output");

  queue1     = gst_element_factory_make ("queue", "queue1");
  queue2     = gst_element_factory_make ("queue", "queue2");

  if (!pipeline || !source || !demuxer || !decoder || !conv || !sink) {
    g_printerr ("One element could not be created. Exiting.\n");
    return -1;
  }

  /* Set up the pipeline */

  /* we set the input filename to the source element */
  g_object_set (G_OBJECT (source), "location", argv[1], NULL);

  /* we add a message handler */
  bus = gst_pipeline_get_bus (GST_PIPELINE (pipeline));
  gst_bus_add_watch (bus, bus_call, loop);
  gst_object_unref (bus);

  /* we add all elements into the pipeline */
  /* file-source | ogg-demuxer | vorbis-decoder | converter | alsa-output */
  gst_bin_add_many (GST_BIN (pipeline),
                    source, demuxer, queue1, decoder, conv, sink, queue2, vdecoder, vconv, vsink, NULL);

  /* we link the elements together */
  /* file-source -> ogg-demuxer ~> vorbis-decoder -> converter -> alsa-output */
  gst_element_link (source, demuxer);
  gst_element_link_many (queue1, decoder, conv, sink, NULL);
  gst_element_link_many (queue2, vdecoder, vconv, vsink, NULL);

  //GstStructure *data = 

  //GstElement *decoders[2] = {decoder, vdecoder};
  g_signal_connect (demuxer, "pad-added", G_CALLBACK (on_pad_added), GST_BIN (pipeline));
  //g_signal_connect (queue2, "pad-added", G_CALLBACK (on_pad_added), vdecoder);

  /* note that the demuxer will be linked to the decoder dynamically.
     The reason is that Ogg may contain various streams (for example
     audio and video). The source pad(s) will be created at run time,
     by the demuxer when it detects the amount and nature of streams.
     Therefore we connect a callback function which will be executed
     when the "pad-added" is emitted.*/


  /* Set the pipeline to "playing" state*/
  g_print ("Now playing: %s\n", argv[1]);
  gst_element_set_state (pipeline, GST_STATE_PLAYING);


  /* Iterate */
  g_print ("Running...\n");
  g_main_loop_run (loop);


  /* Out of the main loop, clean up nicely */
  g_print ("Returned, stopping playback\n");
  gst_element_set_state (pipeline, GST_STATE_NULL);

  g_print ("Deleting pipeline\n");
  gst_object_unref (GST_OBJECT (pipeline));

  return 0;
}
